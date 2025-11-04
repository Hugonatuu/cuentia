

'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { addDoc, runTransaction, doc } from 'firebase/firestore';
import { userStoriesCollectionRef, userDocRef } from '@/firebase/firestore/references';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, CreditCard, Info, PlusCircle, BookHeart, Lightbulb, Pencil, BookImage } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import AuthPopup from '@/components/core/AuthPopup';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { CharacterSlot } from '../components/CharacterSlot';
import { Character, CharacterWithCustomization, PredefinedCharacter } from '../components/types';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';
import { serverTimestamp } from 'firebase/firestore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getPlanLimits } from '@/lib/plans';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const categoryDetails: {
  [key: string]: { title: string; description: string; };
} = {
  'aprendizaje': {
    title: '¡Crea tu cuento!',
    description:
      'Transforma tu imaginación en un cuento inolvidable lleno de ilustraciones y magia, donde cada página cobra vida con tus propias ideas y personajes.',
  },
};

const webhookUrls: { [key: string]: string } = {
  '4': 'https://natuai-n8n.kl7z6h.easypanel.host/webhook/487acb8c-418a-46ad-84ed-522c7ac87a9d',
  '12': 'https://natuai-n8n.kl7z6h.easypanel.host/webhook/45129045-1e5b-4f16-b77d-17c2670279db',
  '20': 'https://natuai-n8n.kl7z6h.easypanel.host/webhook/c855ecc7-a53c-4334-be2b-18efe019e251',
};

const creditCosts = {
  images: {
    '4': 800,
    '12': 1500,
    '20': 2400,
  },
  customization: 100,
  illustrateBase: 200,
  illustratePerPage: 100,
};

const learningObjectiveSuggestions = [
    'Enseñar la importancia de cuidar a los demás',
    'Aprender a valorar las cosas',
    'Hacer ver al protagonista que es más fuerte de lo que cree',
    'Descubrir que ser diferente es algo especial',
    'Aprender a expresar y entender las emociones',
    'Enseñar a perdonar y a pedir perdón',
    'Aprender que todos cometemos errores y que está bien',
    'Comprender el valor de decir la verdad',
    'Enseñar a respetar a los demás, sin importar sus diferencias',
    'Aprender a escuchar y compartir',
    'Aprender a superar el miedo a...',
    'Enseñar a confiar en uno mismo'
];


const createFormSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio.').max(35, 'El título no puede tener más de 35 caracteres.'),
  learningObjective: z.string().max(200, 'El objetivo de aprendizaje no puede exceder los 200 caracteres.').optional(),
  readerAge: z.string().min(1, 'La edad es obligatoria.'),
  readerName: z.string().min(1, 'El nombre del lector es obligatorio.').max(20, 'El nombre no puede tener más de 20 caracteres.'),
  imageCount: z.string().min(1, 'Debes seleccionar un número de imágenes.'),
  prompt: z.string().max(220, 'Los puntos clave no pueden tener más de 220 caracteres.').optional(),
  initialPhrase: z.string().max(150, 'La frase no puede tener más de 150 caracteres.').optional(),
  finalPhrase: z.string().max(150, 'La frase no puede tener más de 150 caracteres.').optional(),
  characters: z.array(z.custom<CharacterWithCustomization>()).min(1, 'Debes seleccionar al menos un personaje.').max(4, 'Puedes seleccionar hasta 4 personajes.'),
  backCoverImage: z.instanceof(File).optional(),
  language: z.string().min(1, 'Debes seleccionar un idioma.'),
});

type CreateStoryFormValues = z.infer<typeof createFormSchema>;

interface UserProfile {
    stripeRole?: string;
    monthlyCreditCount?: number;
    payAsYouGoCredits?: number;
}

interface Story {
  id: string;
  status: 'generating' | 'completed' | 'generating_illustration';
}


const createIllustrateFormSchema = (pageCount: number) => z.object({
  title: z.string().min(1, 'El título es obligatorio.').max(50, 'El título no puede exceder los 50 caracteres.'),
  readerName: z.string().min(1, 'El nombre del lector es obligatorio.').max(20, 'El nombre no puede tener más de 20 caracteres.'),
  characters: z.array(z.custom<CharacterWithCustomization>()).min(1, 'Debes seleccionar al menos un personaje.').max(4, 'Puedes seleccionar hasta 4 personajes.'),
  pages: z.array(z.string().max(500, 'Cada página no puede exceder los 500 caracteres.')).refine(pages => pages.every(p => p.trim() !== ''), {
    message: 'Debes completar todas las páginas.',
  }).refine(pages => pages.length === pageCount, {
    message: `Debes completar las ${pageCount} páginas.`,
  }),
  initialPhrase: z.string().max(150, 'La frase no puede tener más de 150 caracteres.').optional(),
  finalPhrase: z.string().max(150, 'La frase no puede tener más de 150 caracteres.').optional(),
  backCoverImage: z.instanceof(File).optional(),
});


type IllustrateFormValues = z.infer<ReturnType<typeof createIllustrateFormSchema>>;


export default function CrearCuentoPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDedication, setShowDedication] = useState(false);
  const [showBackCoverImage, setShowBackCoverImage] = useState(false);
  const [backCoverPreview, setBackCoverPreview] = useState<string | null>(null);
  const [totalCredits, setTotalCredits] = useState(0);
  const [numberOfPages, setNumberOfPages] = useState<number>(6);
  const [illustratedPages, setIllustratedPages] = useState<Set<number>>(new Set());
  const [illustrateCredits, setIllustrateCredits] = useState(creditCosts.illustrateBase);
  const [showGeneratingPopup, setShowGeneratingPopup] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const userRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return userDocRef(firestore, user.uid);
  }, [firestore, user]);

  const { data: userProfile } = useDoc<UserProfile>(userRef);

   const userStoriesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return userStoriesCollectionRef(firestore, user.uid);
  }, [firestore, user]);
  
  const { data: stories } = useCollection<Story>(userStoriesQuery);

  const isStoryGenerating = stories?.some(s => s.status === 'generating' || s.status === 'generating_illustration') || false;


  const categoria = Array.isArray(params.categoria)
    ? params.categoria[0]
    : params.categoria;

  const details = categoryDetails[categoria] || {
    title: '¡Crea tu cuento!',
    description: 'Rellena los detalles y deja que la magia haga el resto.',
  };

  const form = useForm<CreateStoryFormValues>({
    resolver: zodResolver(createFormSchema),
    defaultValues: {
      title: '',
      learningObjective: '',
      readerAge: '',
      readerName: '',
      imageCount: '',
      prompt: '',
      initialPhrase: '',
      finalPhrase: '',
      characters: [],
      language: 'es',
    },
  });

  const illustrateFormSchema = createIllustrateFormSchema(numberOfPages);
  
  const illustrateForm = useForm<IllustrateFormValues>({
    resolver: zodResolver(illustrateFormSchema),
    defaultValues: {
      title: '',
      readerName: '',
      characters: [],
      pages: Array(numberOfPages).fill(''),
      initialPhrase: '',
      finalPhrase: '',
    },
  });

  useEffect(() => {
    const currentPages = illustrateForm.getValues('pages');
    illustrateForm.reset({
        title: illustrateForm.getValues('title'),
        readerName: illustrateForm.getValues('readerName'),
        characters: illustrateForm.getValues('characters'),
        pages: Array(numberOfPages).fill('').map((_, i) => currentPages[i] || ''),
        initialPhrase: illustrateForm.getValues('initialPhrase'),
        finalPhrase: illustrateForm.getValues('finalPhrase'),
        backCoverImage: illustrateForm.getValues('backCoverImage'),
    });
  }, [numberOfPages, illustrateForm]);

  const watchedImageCount = form.watch('imageCount');
  const watchedCharacters = form.watch('characters');
  const watchedTitle = form.watch('title');
  const watchedReaderName = form.watch('readerName');
  const watchedPrompt = form.watch('prompt');
  const watchedLearningObjective = form.watch('learningObjective');
  const watchedInitialPhrase = form.watch('initialPhrase');
  const watchedFinalPhrase = form.watch('finalPhrase');
  const watchedLanguage = form.watch('language');
  
  const illustrateWatchedReaderName = illustrateForm.watch('readerName');
  const illustrateWatchedInitialPhrase = illustrateForm.watch('initialPhrase');
  const illustrateWatchedFinalPhrase = illustrateForm.watch('finalPhrase');

  useEffect(() => {
    let credits = 0;
    
    if (watchedImageCount && creditCosts.images[watchedImageCount as keyof typeof creditCosts.images]) {
      credits += creditCosts.images[watchedImageCount as keyof typeof creditCosts.images];
    }

    if (watchedCharacters) {
      const customizationCount = watchedCharacters.filter(c => c && c.visual_description).length;
      credits += customizationCount * creditCosts.customization;
    }
    
    setTotalCredits(credits);
  }, [watchedImageCount, watchedCharacters]);

   useEffect(() => {
    const newCredits = creditCosts.illustrateBase + illustratedPages.size * creditCosts.illustratePerPage;
    setIllustrateCredits(newCredits);
  }, [illustratedPages]);


  const handleInteraction = () => {
    if (!user && !isUserLoading) {
      setPopupOpen(true);
    }
  };

  const handleFormInteraction = () => {
    if (isStoryGenerating) {
        setShowGeneratingPopup(true);
    }
  };

  const handleBackCoverImageChange = (event: React.ChangeEvent<HTMLInputElement>, formType: 'create' | 'illustrate') => {
    const file = event.target.files?.[0];
    if (file) {
      if (formType === 'create') {
        form.setValue('backCoverImage', file);
      } else {
        illustrateForm.setValue('backCoverImage', file);
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
       if (formType === 'create') {
        form.setValue('backCoverImage', undefined);
      } else {
        illustrateForm.setValue('backCoverImage', undefined);
      }
      setBackCoverPreview(null);
    }
  };
  
    const handleIllustrationToggle = (pageIndex: number) => {
        setIllustratedPages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(pageIndex)) {
                newSet.delete(pageIndex);
            } else {
                newSet.add(pageIndex);
            }
            return newSet;
        });
    };

  async function onSubmit(data: CreateStoryFormValues) {
    if (!user || !firestore || !userProfile) {
      handleInteraction();
      return;
    }

    if (isStoryGenerating) {
        setShowGeneratingPopup(true);
        return;
    }
    
    const planLimits = userProfile.stripeRole ? getPlanLimits(userProfile.stripeRole) : 0;
    const monthlyCreditsUsed = userProfile.monthlyCreditCount || 0;
    const availableMonthlyCredits = planLimits - monthlyCreditsUsed;
    const payAsYouGoCredits = userProfile.payAsYouGoCredits || 0;
    const totalAvailableCredits = availableMonthlyCredits + payAsYouGoCredits;
    
    if (totalAvailableCredits < totalCredits) {
        toast({
            variant: 'destructive',
            title: 'Créditos insuficientes',
            description: `Necesitas ${totalCredits} créditos para crear este cuento, pero solo te quedan ${totalAvailableCredits}.`,
        });
        return;
    }

    const webhookUrl = webhookUrls[data.imageCount];

    if (!webhookUrl) {
        toast({
            variant: 'destructive',
            title: 'Error de configuración',
            description: 'La selección de imágenes no tiene un webhook asociado. Por favor, selecciona una opción válida.',
        });
        return;
    }

    setIsSubmitting(true);
    
     try {
        const userRef = userDocRef(firestore, user.uid);
        await runTransaction(firestore, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw "El documento del usuario no existe.";
            }
            const currentProfile = userDoc.data() as UserProfile;
            const currentMonthlyUsed = currentProfile.monthlyCreditCount || 0;
            const currentPayAsYouGo = currentProfile.payAsYouGoCredits || 0;
            const availableMonthly = (getPlanLimits(currentProfile.stripeRole || '') - currentMonthlyUsed);

            let monthlyCreditsToDebit = 0;
            let payAsYouGoCreditsToDebit = 0;
            
            if (availableMonthly > 0) {
                monthlyCreditsToDebit = Math.min(totalCredits, availableMonthly);
            }

            const remainingCost = totalCredits - monthlyCreditsToDebit;

            if (remainingCost > 0) {
                 payAsYouGoCreditsToDebit = Math.min(remainingCost, currentPayAsYouGo);
            }

            transaction.update(userRef, { 
                monthlyCreditCount: currentMonthlyUsed + monthlyCreditsToDebit,
                payAsYouGoCredits: currentPayAsYouGo - payAsYouGoCreditsToDebit,
            });
        });

        const characterImagesText = data.characters
          .filter(c => !c.visual_description)
          .map(c => {
            const baseCharacter = c.character;
            const imageUrl = 'avatarUrl' in baseCharacter ? baseCharacter.avatarUrl : baseCharacter.imageUrl;
            return `${baseCharacter.name}:\n${imageUrl}`;
        }).join('\n\n');
        
        const personalizacionText = data.characters
          .filter(c => c.visual_description)
          .map(c => {
            const baseCharacter = c.character;
            const imageUrl = 'avatarUrl' in baseCharacter ? baseCharacter.avatarUrl : baseCharacter.imageUrl;
            return `nombre: ${baseCharacter.name}\nurl: ${imageUrl}\ndescripcion: ${c.visual_description}`;
          }).join('\n\n');

        const charactersForWebhook = data.characters.map(({ character, visual_description }) => {
            const isPredefined = 'imageUrl' in character;
            const lang = data.language.substring(0, 2) as keyof PredefinedCharacter['description'];
            
            const predefinedChar = isPredefined ? (character as PredefinedCharacter) : null;
            const userChar = !isPredefined ? (character as Character) : null;

            return {
                name: character.name,
                gender: predefinedChar ? (predefinedChar.gender[lang] || predefinedChar.gender['es']) : (userChar?.gender[lang] || userChar?.gender['es']),
                age: character.age,
                description: predefinedChar ? (predefinedChar.description[lang] || predefinedChar.description['es']) : '',
                species: predefinedChar ? (predefinedChar.species[lang] || predefinedChar.species['es']) : (userChar?.species[lang] || userChar?.species['es']),
                visual_description: isPredefined ? (predefinedChar.visual_description[lang] || predefinedChar.visual_description['es']) : visual_description || '',
            };
        });

        const storiesColRef = userStoriesCollectionRef(firestore, user.uid);
        
        const storyData = {
          userId: user.uid,
          title: data.title,
          learningObjective: data.learningObjective || '',
          readerAge: data.readerAge,
          readerName: data.readerName,
          imageCount: parseInt(data.imageCount, 10),
          prompt: data.prompt || '',
          initialPhrase: data.initialPhrase || '',
          finalPhrase: data.finalPhrase || '',
          characters: data.characters.map(({character}) => {
             const { id, createdAt, ...rest } = character as any;
             return rest;
          }),
          status: 'generating',
          createdAt: serverTimestamp(),
          coverImageUrl: '',
          pdfUrl: '',
          language: data.language,
        };

        const storyDocRef = await addDoc(storiesColRef, storyData);
        
        if (!storyDocRef) {
          throw new Error('No se pudo crear el documento del cuento.');
        }

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (key !== 'characters' && key !== 'backCoverImage' && value) {
            formData.append(key, value as string);
          }
        });
        formData.append('storyId', storyDocRef.id);
        formData.append('userId', user.uid);
        formData.append('characterImagesText', characterImagesText);
        formData.append('personalizacion', personalizacionText);
        formData.append('characters', JSON.stringify(charactersForWebhook));
        if (data.backCoverImage) {
          formData.append('backCoverImage', data.backCoverImage);
        }

        const response = await fetch(webhookUrl, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
        }
        
        toast({
            title: '¡Cuento en camino!',
            description: 'Tu historia se está generando. Recibirás una notificación cuando esté lista.',
        });
        
        form.reset();
        router.push('/perfil');

    } catch (error) {
        console.error('Error al crear el cuento o llamar al webhook:', error);
        const errorMessage = error instanceof Error ? error.message : 'Hubo un problema al contactar el servidor.';
        toast({
            variant: 'destructive',
            title: 'Error al generar el cuento',
            description: errorMessage,
        });

        const userRef = userDocRef(firestore, user.uid);
        await runTransaction(firestore, async (transaction) => {
            const userDoc = await transaction.get(userRef);
             if (!userDoc.exists()) {
                return;
            }
            const currentProfile = userDoc.data() as UserProfile;
            const currentMonthlyUsed = currentProfile.monthlyCreditCount || 0;
            const currentPayAsYouGo = currentProfile.payAsYouGoCredits || 0;
            const availableMonthly = (getPlanLimits(currentProfile.stripeRole || '') - currentMonthlyUsed);

            let monthlyCreditsToDebit = 0;
            if (availableMonthly > 0) {
                monthlyCreditsToDebit = Math.min(totalCredits, availableMonthly);
            }
            const remainingCost = totalCredits - monthlyCreditsToDebit;
            let payAsYouGoCreditsToDebit = 0;
            if (remainingCost > 0) {
                 payAsYouGoCreditsToDebit = Math.min(remainingCost, currentPayAsYouGo);
            }

            transaction.update(userRef, { 
                monthlyCreditCount: currentMonthlyUsed - monthlyCreditsToDebit,
                payAsYouGoCredits: currentPayAsYouGo + payAsYouGoCreditsToDebit,
            });
        });

    } finally {
        setIsSubmitting(false);
    }
  }

  async function onIllustrateSubmit(data: IllustrateFormValues) {
    if (!user || !firestore || !userProfile) {
        handleInteraction();
        return;
    }

    if (isStoryGenerating) {
        setShowGeneratingPopup(true);
        return;
    }

     const totalCost = illustrateCredits;

    const planLimits = userProfile.stripeRole ? getPlanLimits(userProfile.stripeRole) : 0;
    const monthlyCreditsUsed = userProfile.monthlyCreditCount || 0;
    const availableMonthlyCredits = planLimits - monthlyCreditsUsed;
    const payAsYouGoCredits = userProfile.payAsYouGoCredits || 0;
    const totalAvailableCredits = availableMonthlyCredits + payAsYouGoCredits;

    if (totalAvailableCredits < totalCost) {
        toast({
            variant: 'destructive',
            title: 'Créditos insuficientes',
            description: `Necesitas ${totalCost} créditos para ilustrar este cuento, pero solo te quedan ${totalAvailableCredits}.`,
        });
        return;
    }

    setIsSubmitting(true);

    try {
        // --- Debit Credits ---
        const userRef = userDocRef(firestore, user.uid);
        await runTransaction(firestore, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) throw "El documento del usuario no existe.";
            
            const currentProfile = userDoc.data() as UserProfile;
            const currentMonthlyUsed = currentProfile.monthlyCreditCount || 0;
            const currentPayAsYouGo = currentProfile.payAsYouGoCredits || 0;
            const availableMonthly = getPlanLimits(currentProfile.stripeRole || '') - currentMonthlyUsed;
            
            let monthlyDebit = Math.min(totalCost, availableMonthly);
            let paygDebit = Math.max(0, totalCost - monthlyDebit);

            transaction.update(userRef, { 
                monthlyCreditCount: currentMonthlyUsed + monthlyDebit,
                payAsYouGoCredits: currentPayAsYouGo - paygDebit,
            });
        });

        // --- Prepare Data ---
        const storiesColRef = userStoriesCollectionRef(firestore, user.uid);
        const storyData = {
            userId: user.uid,
            title: data.title,
            readerName: data.readerName,
            characters: data.characters.map(({ character }) => {
                const { id, createdAt, ...rest } = character as any;
                return rest;
            }),
            pages: data.pages,
            illustratedPages: Array.from(illustratedPages),
            status: 'generating_illustration',
            createdAt: serverTimestamp(),
            coverImageUrl: '',
            pdfUrl: '',
            initialPhrase: data.initialPhrase || '',
            finalPhrase: data.finalPhrase || '',
        };
        const storyDocRef = await addDoc(storiesColRef, storyData);
        if (!storyDocRef) throw new Error('No se pudo crear el documento del cuento.');

        const characterImagesText = data.characters
            .filter(c => !c.visual_description)
            .map(c => `${c.character.name}:\n${'avatarUrl' in c.character ? c.character.avatarUrl : c.character.imageUrl}`)
            .join('\n\n');

        const personalizacionText = data.characters
            .filter(c => c.visual_description)
            .map(c => `nombre: ${c.character.name}\nurl: ${'avatarUrl' in c.character ? c.character.avatarUrl : c.character.imageUrl}\ndescripcion: ${c.visual_description}`)
            .join('\n\n');

        const pagesWithIllustrationInfo = data.pages.map((text, index) => ({
            page_number: index + 1,
            text,
            illustration: illustratedPages.has(index) ? 'si' : 'no',
        }));

        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('readerName', data.readerName);
        formData.append('storyId', storyDocRef.id);
        formData.append('userId', user.uid);
        formData.append('characterImagesText', characterImagesText);
        formData.append('personalizacion', personalizacionText);
        formData.append('pages', JSON.stringify(pagesWithIllustrationInfo));
        formData.append('initialPhrase', data.initialPhrase || '');
        formData.append('finalPhrase', data.finalPhrase || '');

        if (data.backCoverImage) {
          formData.append('backCoverImage', data.backCoverImage);
        }

        // --- Call Webhook ---
        const response = await fetch('https://natuai-n8n.kl7z6h.easypanel.host/webhook/7cd69962-5db3-4ff7-813e-3f493310a1c8', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error del webhook del servidor: ${response.status} - ${errorText}`);
        }

        toast({
            title: '¡Tu cuento se está ilustrando!',
            description: 'Recibirás una notificación cuando esté listo.',
        });
        
        illustrateForm.reset();
        setIllustratedPages(new Set());
        router.push('/perfil');

    } catch (error) {
        console.error('Error al enviar para ilustrar:', error);
        toast({
            variant: 'destructive',
            title: 'Error al ilustrar el cuento',
            description: error instanceof Error ? error.message : 'Hubo un problema al contactar el servidor.',
        });
        // TODO: Implement credit rollback on failure
    } finally {
        setIsSubmitting(false);
    }
  }

  if (isUserLoading) {
    return (
      <div className="container mx-auto max-w-5xl py-12">
        <div className="text-center mb-12">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
        </div>
        <Card className="shadow-lg p-8">
          <div className="space-y-8">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-2 gap-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-32 w-full" />
            <div className="flex justify-center">
              <Skeleton className="h-12 w-48" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl py-12" onFocus={handleFormInteraction}>
      <AuthPopup
        isOpen={isPopupOpen}
        onOpenChange={setPopupOpen}
        title="✨ ¡Regístrate para crear tu cuento! ✨"
        description="¡Únete a la magia! Crea una cuenta para empezar a generar tus propias historias y personajes únicos."
        actionText="Registrarse"
        redirectPath="/registro"
      />
      <AlertDialog open={showGeneratingPopup} onOpenChange={setShowGeneratingPopup}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¡Ups! Aún hay un cuento en el horno 🧁</AlertDialogTitle>
                <AlertDialogDescription>
                    Espera un poquito y podrás crear el siguiente.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction>Entendido</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Tabs defaultValue="create" className="w-full">
        <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="create"><Pencil className="mr-2 h-4 w-4" />Crea tu cuento</TabsTrigger>
                <TabsTrigger value="illustrate"><BookImage className="mr-2 h-4 w-4" />Ilustra tu cuento</TabsTrigger>
            </TabsList>
        </div>

        <div className="text-center mb-12">
            <h1 className="font-headline text-4xl md:text-5xl text-gray-800">
                {details.title}
            </h1>
            <p className="max-w-xl mx-auto text-primary mt-4 font-body">
                {details.description}
            </p>
        </div>

        <TabsContent value="create">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              <Card className="shadow-lg overflow-visible">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold">1. Datos principales del cuento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título del Cuento</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="El misterio del bosque encantado"
                            {...field}
                            maxLength={35}
                          />
                        </FormControl>
                        <div className="flex justify-between">
                            <FormMessage />
                            <div className="text-xs text-right text-muted-foreground">{watchedTitle.length}/35</div>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="readerAge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Edad del Lector</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona una edad" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="3-5">3-5 años</SelectItem>
                              <SelectItem value="6-8">6-8 años</SelectItem>
                              <SelectItem value="9-12">9-12 años</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="readerName"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel>Nombre del Lector</FormLabel>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Pon el nombre del lector para personalizar la primera pagina del libro</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <FormControl>
                            <Input placeholder="Leo" {...field} maxLength={20} />
                          </FormControl>
                          <div className="flex justify-between">
                                <FormMessage />
                                <div className="text-xs text-right text-muted-foreground">{watchedReaderName.length}/20</div>
                            </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-semibold">2. Personajes</CardTitle>
                    <div className="w-fit bg-primary text-primary-foreground px-3 py-1 rounded-lg">
                      <p className="text-sm">Elige hasta 4 personajes para tu historia. ¡Puedes crear los tuyos!</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <FormField
                        control={form.control}
                        name="characters"
                        render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[...Array(4)].map((_, index) => (
                                        <CharacterSlot
                                            key={index}
                                            characterWithCustomization={field.value[index]}
                                            allSelectedCharacters={field.value.map(c => c.character)}
                                            onSelect={(character) => {
                                                const newCharacters = [...field.value];
                                                newCharacters[index] = { character, visual_description: '' };
                                                field.onChange(newCharacters.filter(c => c !== undefined));

                                            }}
                                            onRemove={() => {
                                                const newCharacters = field.value.filter((_, i) => i !== index);
                                                field.onChange(newCharacters);
                                            }}
                                            onUpdateCustomization={(visual_description) => {
                                            const newCharacters = [...field.value];
                                            if (newCharacters[index]) {
                                                newCharacters[index].visual_description = visual_description;
                                                field.onChange(newCharacters);
                                            }
                                            }}
                                        />
                                    ))}
                                </div>
                            </FormControl>
                            <FormMessage className="pt-2" />
                        </FormItem>
                        )}
                    />
                </CardContent>
              </Card>
              
              <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex flex-row items-center justify-between">
                      <CardTitle className="text-2xl font-semibold">3. Detalles de la historia</CardTitle>
                      <div className="w-fit bg-primary text-primary-foreground px-3 py-1 rounded-lg">
                          <p className="text-sm">Añade los toques finales para que tu cuento sea único.</p>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-foreground p-3 bg-accent/20 border border-accent/50 rounded-lg">
                      💡 Consejo: te recomendamos escribir los detalles en el mismo idioma en el que vas a generar el cuento, para que el resultado sea más natural y preciso.
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Puntos Clave de la Trama (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Leo, que es el protagonista, se va de viaje con su abuela Maria y conoce a una chica (Ana) que se hará su mejor amiga."
                            rows={4}
                            maxLength={220}
                            {...field}
                          />
                        </FormControl>
                        <div className="flex justify-between">
                            <FormMessage />
                            <div className="text-xs text-right text-muted-foreground">{(watchedPrompt || '').length}/220</div>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="learningObjective"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                            <FormLabel>
                              Objetivo de Aprendizaje (Opcional)
                            </FormLabel>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button type="button" size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                                        <Lightbulb className="mr-2 h-4 w-4" />
                                        Ideas
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {learningObjectiveSuggestions.map((suggestion, index) => (
                                        <DropdownMenuItem key={index} onSelect={() => form.setValue('learningObjective', suggestion)}>
                                            {suggestion}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <FormControl>
                          <Textarea
                            placeholder="Ej: Enseñar a Leo la importancia de la amistad y el trabajo en equipo."
                            maxLength={200}
                            {...field}
                          />
                        </FormControl>
                        <div className="flex justify-between">
                            <FormMessage />
                            <div className="text-xs text-right text-muted-foreground">{(watchedLearningObjective || '').length}/200</div>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                        control={form.control}
                        name="imageCount"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>
                                ¿Cuántas imágenes quieres añadir a tu cuento?
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una cantidad" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                <SelectItem value="4">4 imágenes + portada (800cd)</SelectItem>
                                <SelectItem value="12">12 imágenes + Portada (1.500cd)</SelectItem>
                                <SelectItem value="20">20 imágenes + Portada (2.400cd)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
              </Card>
              
              <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold">4. Toques Mágicos (Opcional)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4 rounded-lg border bg-card-foreground/5 p-4">
                      <div className="flex items-center space-x-3">
                        <Switch
                          id="show-dedication"
                          checked={showDedication}
                          onCheckedChange={setShowDedication}
                        />
                        <FormLabel htmlFor="show-dedication" className="text-base font-semibold cursor-pointer">
                          Añadir una dedicatoria especial
                        </FormLabel>
                      </div>
                      {showDedication && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 animate-in fade-in-0 duration-300">
                          <FormField
                            control={form.control}
                            name="initialPhrase"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Frase al inicio del cuento
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Para mi querido Leo, con todo mi amor."
                                    {...field}
                                    maxLength={150}
                                  />
                                </FormControl>
                                <div className="flex justify-between">
                                    <FormMessage />
                                    <div className="text-xs text-right text-muted-foreground">{(watchedInitialPhrase || '').length}/150</div>
                                </div>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="finalPhrase"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Frase al final del cuento
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="De tu Mamá, que te quiere con locura."
                                    {...field}
                                    maxLength={150}
                                  />
                                </FormControl>
                                <div className="flex justify-between">
                                    <FormMessage />
                                    <div className="text-xs text-right text-muted-foreground">{(watchedFinalPhrase || '').length}/150</div>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 rounded-lg border bg-card-foreground/5 p-4">
                        <div className="flex items-center space-x-3">
                            <Switch
                                id="show-back-cover-image"
                                checked={showBackCoverImage}
                                onCheckedChange={setShowBackCoverImage}
                            />
                            <FormLabel htmlFor="show-back-cover-image" className="text-base font-semibold cursor-pointer">
                                Añadir una imagen en la contraportada
                            </FormLabel>
                        </div>
                        {showBackCoverImage && (
                            <div className="pt-4 animate-in fade-in-0 duration-300">
                                <FormField
                                    control={form.control}
                                    name="backCoverImage"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Imagen de contraportada</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center gap-4">
                                                    <label htmlFor="back-cover-upload" className="cursor-pointer">
                                                        <div className="flex items-center gap-2 rounded-md border border-input px-4 py-2 hover:bg-accent">
                                                            <PlusCircle className="h-4 w-4" />
                                                            <span>{backCoverPreview ? 'Cambiar imagen' : 'Subir imagen'}</span>
                                                        </div>

                                                        <input 
                                                            id="back-cover-upload"
                                                            type="file" 
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => handleBackCoverImageChange(e, 'create')} 
                                                        />
                                                    </label>
                                                    {backCoverPreview && (
                                                        <div className="relative w-20 h-20">
                                                            <Image
                                                                src={backCoverPreview}
                                                                alt="Vista previa de la contraportada"
                                                                fill
                                                                className="rounded-md object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                    </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">Idioma</CardTitle>
                    <div className="mt-2 text-sm text-foreground p-3 bg-white border border-destructive rounded-lg">
                    🎯 Asegúrate de escribir los detalles de tu historia en el mismo idioma en el que vas a crear el cuento, para que todo encaje a la perfección.
                  </div>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Idioma del Cuento</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un idioma" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="en">Inglés</SelectItem>
                            <SelectItem value="fr">Francés</SelectItem>
                            <SelectItem value="it">Italiano</SelectItem>
                            <SelectItem value="de">Alemán</SelectItem>
                            <SelectItem value="pt">Portugués</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>


                <div className="flex flex-col items-center justify-center gap-4 pt-4 sticky bottom-6">
                    <Card className="p-2 px-3 flex items-center gap-2 shadow-lg bg-accent/50">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <span className="text-sm font-bold text-primary">
                            Coste Total: {totalCredits} créditos
                        </span>
                    </Card>
                    <Button
                      type="submit"
                      size="lg"
                      className="shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/50 hover:-translate-y-0.5"
                      disabled={isSubmitting || totalCredits === 0 || isStoryGenerating}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Crear mi Cuento Mágico
                        </>
                      )}
                    </Button>
                  </div>
            </form>
          </Form>
        </TabsContent>
        
        <TabsContent value="illustrate">
           <Form {...illustrateForm}>
            <form onSubmit={illustrateForm.handleSubmit(onIllustrateSubmit)} className="space-y-10">
                <Card className="shadow-lg">
                    <CardContent className="space-y-6 pt-6">
                        <FormField
                            control={illustrateForm.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título del Cuento</FormLabel>
                                    <FormControl>
                                        <Input placeholder="El viaje inolvidable de Leo" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                          control={illustrateForm.control}
                          name="readerName"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center gap-2">
                                <FormLabel>Nombre del Lector</FormLabel>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Pon el nombre del lector para personalizar la primera pagina del libro</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <FormControl>
                                <Input placeholder="Leo" {...field} maxLength={20} />
                              </FormControl>
                              <div className="flex justify-between">
                                    <FormMessage />
                                    <div className="text-xs text-right text-muted-foreground">{(illustrateWatchedReaderName || '').length}/20</div>
                                </div>
                            </FormItem>
                          )}
                        />
                    </CardContent>
                </Card>

                 <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-2xl font-semibold">Personajes</CardTitle>
                        <div className="w-fit bg-primary text-primary-foreground px-3 py-1 rounded-lg">
                        <p className="text-sm">Elige hasta 4 personajes para tu historia.</p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={illustrateForm.control}
                            name="characters"
                            render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[...Array(4)].map((_, index) => (
                                            <CharacterSlot
                                                key={index}
                                                characterWithCustomization={field.value[index]}
                                                allSelectedCharacters={field.value.map(c => c.character)}
                                                onSelect={(character) => {
                                                    const newCharacters = [...field.value];
                                                    newCharacters[index] = { character, visual_description: '' };
                                                    field.onChange(newCharacters.filter(c => c !== undefined));
                                                }}
                                                onRemove={() => {
                                                    const newCharacters = field.value.filter((_, i) => i !== index);
                                                    field.onChange(newCharacters);
                                                }}
                                                onUpdateCustomization={(visual_description) => {
                                                const newCharacters = [...field.value];
                                                if (newCharacters[index]) {
                                                    newCharacters[index].visual_description = visual_description;
                                                    field.onChange(newCharacters);
                                                }
                                                }}
                                            />
                                        ))}
                                    </div>
                                </FormControl>
                                <FormMessage className="pt-2" />
                            </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
                
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold">Contenido de las páginas</CardTitle>
                        <Alert className="bg-yellow-100 border-yellow-300 text-yellow-800">
                            <Sparkles className="h-4 w-4 !text-yellow-800" />
                            <AlertTitle>¡Dale vida a tus páginas!</AlertTitle>
                            <AlertDescription>
                                Cada página que elijas illustrar tiene un coste adicional de 100 créditos.
                            </AlertDescription>
                        </Alert>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        
                        <FormItem>
                          <FormLabel>Número de páginas</FormLabel>
                          <Select
                            onValueChange={(value) => setNumberOfPages(parseInt(value, 10))}
                            defaultValue={String(numberOfPages)}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona el número de páginas" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from({ length: 15 }, (_, i) => 6 + i).map(num => (
                                <SelectItem key={num} value={String(num)}>
                                  {num} páginas
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           {Array.from({ length: numberOfPages }).map((_, index) => (
                            <FormField
                                key={index}
                                control={illustrateForm.control}
                                name={`pages.${index}`}
                                render={({ field }) => (
                                <FormItem>
                                    <div className="flex justify-between items-center">
                                        <FormLabel>Página {index + 1}</FormLabel>
                                        <div className="flex items-center gap-2">
                                            <label htmlFor={`illustrate-switch-${index}`} className="text-sm font-medium text-primary">Ilustrar</label>
                                            <Switch
                                                id={`illustrate-switch-${index}`}
                                                checked={illustratedPages.has(index)}
                                                onCheckedChange={() => handleIllustrationToggle(index)}
                                                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-500 data-[state=checked]:to-yellow-500"
                                            />
                                        </div>
                                    </div>
                                    <FormControl>
                                    <Textarea
                                        placeholder={`Escribe aquí el texto para la página ${index + 1}...`}
                                        {...field}
                                        rows={6}
                                    />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold">Toques Mágicos (Opcional)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4 rounded-lg border bg-card-foreground/5 p-4">
                        <div className="flex items-center space-x-3">
                            <Switch
                            id="illustrate-show-dedication"
                            checked={showDedication}
                            onCheckedChange={setShowDedication}
                            />
                            <FormLabel htmlFor="illustrate-show-dedication" className="text-base font-semibold cursor-pointer">
                            Añadir una dedicatoria especial
                            </FormLabel>
                        </div>
                        {showDedication && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 animate-in fade-in-0 duration-300">
                            <FormField
                                control={illustrateForm.control}
                                name="initialPhrase"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                    Frase al inicio del cuento
                                    </FormLabel>
                                    <FormControl>
                                    <Input
                                        placeholder="Para mi querido Leo, con todo mi amor."
                                        {...field}
                                        maxLength={150}
                                    />
                                    </FormControl>
                                    <div className="flex justify-between">
                                        <FormMessage />
                                        <div className="text-xs text-right text-muted-foreground">{(illustrateWatchedInitialPhrase || '').length}/150</div>
                                    </div>
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={illustrateForm.control}
                                name="finalPhrase"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                    Frase al final del cuento
                                    </FormLabel>
                                    <FormControl>
                                    <Input
                                        placeholder="De tu Mamá, que te quiere con locura."
                                        {...field}
                                        maxLength={150}
                                    />
                                    </FormControl>
                                    <div className="flex justify-between">
                                        <FormMessage />
                                        <div className="text-xs text-right text-muted-foreground">{(illustrateWatchedFinalPhrase || '').length}/150</div>
                                    </div>
                                </FormItem>
                                )}
                            />
                            </div>
                        )}
                        </div>

                        <div className="space-y-4 rounded-lg border bg-card-foreground/5 p-4">
                            <div className="flex items-center space-x-3">
                                <Switch
                                    id="illustrate-show-back-cover-image"
                                    checked={showBackCoverImage}
                                    onCheckedChange={setShowBackCoverImage}
                                />
                                <FormLabel htmlFor="illustrate-show-back-cover-image" className="text-base font-semibold cursor-pointer">
                                    Añadir una imagen en la contraportada
                                </FormLabel>
                            </div>
                            {showBackCoverImage && (
                                <div className="pt-4 animate-in fade-in-0 duration-300">
                                    <FormField
                                        control={illustrateForm.control}
                                        name="backCoverImage"
                                        render={() => (
                                            <FormItem>
                                                <FormLabel>Imagen de contraportada</FormLabel>
                                                <FormControl>
                                                    <div className="flex items-center gap-4">
                                                        <label htmlFor="illustrate-back-cover-upload" className="cursor-pointer">
                                                            <div className="flex items-center gap-2 rounded-md border border-input px-4 py-2 hover:bg-accent">
                                                                <PlusCircle className="h-4 w-4" />
                                                                <span>{backCoverPreview ? 'Cambiar imagen' : 'Subir imagen'}</span>
                                                            </div>

                                                            <input 
                                                                id="illustrate-back-cover-upload"
                                                                type="file" 
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(e) => handleBackCoverImageChange(e, 'illustrate')} 
                                                            />
                                                        </label>
                                                        {backCoverPreview && (
                                                            <div className="relative w-20 h-20">
                                                                <Image
                                                                    src={backCoverPreview}
                                                                    alt="Vista previa de la contraportada"
                                                                    fill
                                                                    className="rounded-md object-cover"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col items-center justify-center gap-4 pt-4 sticky bottom-6">
                    <Card className="p-2 px-3 flex items-center gap-2 shadow-lg bg-accent/50">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <span className="text-sm font-bold text-primary">
                            Coste Total: {illustrateCredits} créditos
                        </span>
                    </Card>
                    <Button type="submit" size="lg" disabled={isSubmitting || isStoryGenerating}>
                        {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <BookImage className="mr-2 h-5 w-5" />}
                        Ilustrar mi Cuento
                    </Button>
                </div>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
