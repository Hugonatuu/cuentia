
'use client';

import { useState, useEffect } from 'react';
import {
  useUser,
  useFirestore,
  useDoc,
  useMemoFirebase,
  useCollection,
} from '@/firebase';
import { addDoc, runTransaction, doc } from 'firebase/firestore';
import {
  userStoriesCollectionRef,
  userDocRef,
} from '@/firebase/firestore/references';
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
import {
  Loader2,
  Sparkles,
  CreditCard,
  Info,
  PlusCircle,
  BookHeart,
  Lightbulb,
  Pencil,
  BookImage,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import AuthPopup from '@/components/core/AuthPopup';
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
import {
  Character,
  CharacterWithCustomization,
  PredefinedCharacter,
} from '../components/types';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';

const webhookUrls: { [key: string]: string } = {
  '4': 'https://natuai-n8n.kl7z6h.easypanel.host/webhook/487acb8c-418a-46ad-84ed-522c7ac87a9d',
  '12': 'https://natuai-n8n.kl7z6h.easypanel.host/webhook/45129045-1e5b-4f16-b77d-17c2670279db',
  '20': 'https://natuai-n8n.kl7z6h.easypanel.host/webhook/c855ecc7-a53c-4334-be2b-18efe019e251',
  '11': 'https://natuai-n8n.kl7z6h.easypanel.host/webhook/56804f68-66b7-417c-b2cc-30c86e8ec886',
};

const creditCosts = {
  images: {
    '4': 800,
    '11': 1250,
    '12': 1500,
    '20': 2400,
  },
  customization: 100,
  illustrateBase: 200,
  illustratePerPage: 100,
};

const learningObjectiveSuggestions = [
  'learningObjectiveSuggestion1',
  'learningObjectiveSuggestion2',
  'learningObjectiveSuggestion3',
  'learningObjectiveSuggestion4',
  'learningObjectiveSuggestion5',
  'learningObjectiveSuggestion6',
  'learningObjectiveSuggestion7',
  'learningObjectiveSuggestion8',
  'learningObjectiveSuggestion9',
  'learningObjectiveSuggestion10',
  'learningObjectiveSuggestion11',
  'learningObjectiveSuggestion12',
];

interface UserProfile {
  stripeRole?: string;
  monthlyCreditCount?: number;
  payAsYouGoCredits?: number;
}

interface Story {
  id: string;
  status: 'generating' | 'completed' | 'generating_illustration';
}

export default function CrearCuentoPage() {
  const t = useTranslations('CreateStoryPage');
  const createIllustrateFormSchema = (pageCount: number) =>
    z.object({
      title: z
        .string()
        .min(1, t('validationIllustrateTitleRequired'))
        .max(35, t('validationIllustrateTitleMaxLength')),
      readerName: z
        .string()
        .min(1, t('validationIllustrateReaderNameRequired'))
        .max(20, t('validationIllustrateReaderNameMaxLength')),
      characters: z
        .array(z.custom<CharacterWithCustomization>())
        .min(1, t('validationIllustrateCharactersMin'))
        .max(4, t('validationIllustrateCharactersMax')),
      pages: z
        .array(z.string().max(1000, t('validationIllustratePageMaxLength')))
        .refine((pages) => pages.every((p) => p.trim() !== ''), {
          message: t('validationIllustratePagesRequired'),
        })
        .refine((pages) => pages.length === pageCount, {
          message: t('validationIllustratePagesCount', { pageCount }),
        }),
      initialPhrase: z
        .string()
        .max(500, t('validationIllustratePhraseMaxLength'))
        .optional(),
      finalPhrase: z
        .string()
        .max(500, t('validationIllustratePhraseMaxLength'))
        .optional(),
      backCoverImage: z.instanceof(File).optional(),
      language: z.string().min(1, t('validationLanguageRequired')),
    });

  type IllustrateFormValues = z.infer<
    ReturnType<typeof createIllustrateFormSchema>
  >;
  const createFormSchema = z.object({
    title: z
      .string()
      .min(1, t('validationTitleRequired'))
      .max(35, t('validationTitleMaxLength')),
    learningObjective: z
      .string()
      .max(200, t('validationLearningObjectiveMaxLength'))
      .optional(),
    readerAge: z.string().min(1, t('validationReaderAgeRequired')),
    readerName: z
      .string()
      .min(1, t('validationReaderNameRequired'))
      .max(20, t('validationReaderNameMaxLength')),
    imageCount: z.string().min(1, t('validationImageCountRequired')),
    prompt: z.string().max(600, t('validationPromptMaxLength')).optional(),
    initialPhrase: z
      .string()
      .max(500, t('validationPhraseMaxLength'))
      .optional(),
    finalPhrase: z.string().max(500, t('validationPhraseMaxLength')).optional(),
    characters: z
      .array(z.custom<CharacterWithCustomization>())
      .min(1, t('validationCharactersMin'))
      .max(4, t('validationCharactersMax')),
    backCoverImage: z.instanceof(File).optional(),
    language: z.string().min(1, t('validationLanguageRequired')),
  });

  type CreateStoryFormValues = z.infer<typeof createFormSchema>;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDedication, setShowDedication] = useState(false);
  const [showBackCoverImage, setShowBackCoverImage] = useState(false);
  const [backCoverPreview, setBackCoverPreview] = useState<string | null>(null);
  const [totalCredits, setTotalCredits] = useState(0);
  const [numberOfPages, setNumberOfPages] = useState<number>(6);
  const [illustratedPages, setIllustratedPages] = useState<Set<number>>(
    new Set()
  );
  const [illustrateCredits, setIllustrateCredits] = useState(
    creditCosts.illustrateBase
  );
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

  const isStoryGenerating =
    stories?.some(
      (s) => s.status === 'generating' || s.status === 'generating_illustration'
    ) || false;

  const categoria = Array.isArray(params.categoria)
    ? params.categoria[0]
    : params.categoria;

  const categoryDetails: {
    [key: string]: { title: string; description: string };
  } = {
    aprendizaje: {
      title: t('createStoryTitle'),
      description: t('createStoryDescription'),
    },
  };
  const details = categoryDetails[categoria] || {
    title: t('createStoryTitle'),
    description: t('defaultDescription'),
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
      language: 'es',
    },
  });

  useEffect(() => {
    const currentPages = illustrateForm.getValues('pages');
    illustrateForm.reset({
      ...illustrateForm.getValues(),
      pages: Array(numberOfPages)
        .fill('')
        .map((_, i) => currentPages[i] || ''),
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
  const watchedIllustratePages = illustrateForm.watch('pages');

  const illustrateWatchedTitle = illustrateForm.watch('title');
  const illustrateWatchedReaderName = illustrateForm.watch('readerName');
  const illustrateWatchedInitialPhrase = illustrateForm.watch('initialPhrase');
  const illustrateWatchedFinalPhrase = illustrateForm.watch('finalPhrase');

  useEffect(() => {
    let credits = 0;

    if (
      watchedImageCount &&
      creditCosts.images[watchedImageCount as keyof typeof creditCosts.images]
    ) {
      credits +=
        creditCosts.images[
          watchedImageCount as keyof typeof creditCosts.images
        ];
    }

    if (watchedCharacters) {
      const customizationCount = watchedCharacters.filter(
        (c) => c && c.visual_description
      ).length;
      credits += customizationCount * creditCosts.customization;
    }

    setTotalCredits(credits);
  }, [watchedImageCount, watchedCharacters]);

  useEffect(() => {
    const newCredits =
      creditCosts.illustrateBase +
      illustratedPages.size * creditCosts.illustratePerPage;
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

  const handleBackCoverImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    formType: 'create' | 'illustrate'
  ) => {
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
    setIllustratedPages((prev) => {
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

    const planLimits = userProfile.stripeRole
      ? getPlanLimits(userProfile.stripeRole)
      : 0;
    const monthlyCreditsUsed = userProfile.monthlyCreditCount || 0;
    const availableMonthlyCredits = planLimits - monthlyCreditsUsed;
    const payAsYouGoCredits = userProfile.payAsYouGoCredits || 0;
    const totalAvailableCredits = availableMonthlyCredits + payAsYouGoCredits;

    if (totalAvailableCredits < totalCredits) {
      toast({
        variant: 'destructive',
        title: t('insufficientCreditsTitle'),
        description: t('insufficientCreditsDescription', {
          needed: totalCredits,
          available: totalAvailableCredits,
        }),
      });
      router.push('/precios');
      return;
    }

    const webhookUrl = webhookUrls[data.imageCount];

    if (!webhookUrl) {
      toast({
        variant: 'destructive',
        title: t('configErrorTitle'),
        description: t('configErrorDescription'),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const userRef = userDocRef(firestore, user.uid);
      await runTransaction(firestore, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw t('errorDocumentNotFound');
        }
        const currentProfile = userDoc.data() as UserProfile;
        const currentMonthlyUsed = currentProfile.monthlyCreditCount || 0;
        const currentPayAsYouGo = currentProfile.payAsYouGoCredits || 0;
        const availableMonthly =
          getPlanLimits(currentProfile.stripeRole || '') - currentMonthlyUsed;

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
        .filter((c) => !c.visual_description)
        .map((c) => {
          const baseCharacter = c.character;
          const imageUrl =
            'avatarUrl' in baseCharacter
              ? baseCharacter.avatarUrl
              : baseCharacter.imageUrl;
          return `${baseCharacter.name}:\n${imageUrl}`;
        })
        .join('\n\n');

      const personalizacionText = data.characters
        .filter((c) => c.visual_description)
        .map((c) => {
          const baseCharacter = c.character;
          const imageUrl =
            'avatarUrl' in baseCharacter
              ? baseCharacter.avatarUrl
              : baseCharacter.imageUrl;
          return `nombre: ${baseCharacter.name}\nurl: ${imageUrl}\ndescripcion: ${c.visual_description}`;
        })
        .join('\n\n');

      const charactersForWebhook = data.characters.map(
        ({ character, visual_description }) => {
          const isPredefined = 'imageUrl' in character;
          const lang = data.language.substring(
            0,
            2
          ) as keyof PredefinedCharacter['description'];

          const predefinedChar = isPredefined
            ? (character as PredefinedCharacter)
            : null;
          const userChar = !isPredefined ? (character as Character) : null;

          return {
            name: character.name,
            gender: predefinedChar
              ? predefinedChar.gender[lang] || predefinedChar.gender['es']
              : userChar?.gender[lang] || userChar?.gender?.['es'],
            age: character.age,
            description: predefinedChar
              ? predefinedChar.description[lang] ||
                predefinedChar.description['es']
              : '',
            species: predefinedChar
              ? predefinedChar.species[lang] || predefinedChar.species['es']
              : userChar?.species[lang] || userChar?.species?.['es'],
            visual_description: isPredefined
              ? predefinedChar?.visual_description[lang] ||
                predefinedChar?.visual_description['es']
              : visual_description || '',
          };
        }
      );

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
        characters: data.characters.map(({ character }) => {
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
        throw new Error(t('errorStoryCreationFailed'));
      }

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'characters' && key !== 'backCoverImage' && value) {
          formData.append(key, value as string);
        }
      });
      formData.append('storyId', storyDocRef.id);
      formData.append('userId', user.uid);
      if (user.email) {
        formData.append('userEmail', user.email);
      }
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
        throw new Error(
          `Error del servidor: ${response.status} - ${errorText}`
        );
      }

      toast({
        title: t('storyGeneratingTitle'),
        description: t('storyGeneratingDescription'),
      });

      form.reset();
      router.push('/perfil');
    } catch (error) {
      console.error('Error al crear el cuento o llamar al webhook:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Hubo un problema al contactar el servidor.';
      toast({
        variant: 'destructive',
        title: t('toastStoryErrorTitle'),
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
        const availableMonthly =
          getPlanLimits(currentProfile.stripeRole || '') - currentMonthlyUsed;

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

    const planLimits = userProfile.stripeRole
      ? getPlanLimits(userProfile.stripeRole)
      : 0;
    const monthlyCreditsUsed = userProfile.monthlyCreditCount || 0;
    const availableMonthlyCredits = planLimits - monthlyCreditsUsed;
    const payAsYouGoCredits = userProfile.payAsYouGoCredits || 0;
    const totalAvailableCredits = availableMonthlyCredits + payAsYouGoCredits;

    if (totalAvailableCredits < totalCost) {
      toast({
        variant: 'destructive',
        title: t('insufficientCreditsIllustrateTitle'),
        description: t('insufficientCreditsIllustrateDescription', {
          needed: totalCost,
          available: totalAvailableCredits,
        }),
      });
      router.push('/precios');
      return;
    }

    setIsSubmitting(true);

    try {
      // --- Debit Credits ---
      const userRef = userDocRef(firestore, user.uid);
      await runTransaction(firestore, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw t('errorDocumentNotFound');

        const currentProfile = userDoc.data() as UserProfile;
        const currentMonthlyUsed = currentProfile.monthlyCreditCount || 0;
        const currentPayAsYouGo = currentProfile.payAsYouGoCredits || 0;
        const availableMonthly =
          getPlanLimits(currentProfile.stripeRole || '') - currentMonthlyUsed;

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
        language: data.language,
      };
      const storyDocRef = await addDoc(storiesColRef, storyData);
      if (!storyDocRef)
        throw new Error(t('errorStoryCreationFailed'));

      const characterImagesText = data.characters
        .filter((c) => !c.visual_description)
        .map(
          (c) =>
            `${c.character.name}:\n${
              'avatarUrl' in c.character
                ? c.character.avatarUrl
                : c.character.imageUrl
            }`
        )
        .join('\n\n');

      const personalizacionText = data.characters
        .filter((c) => c.visual_description)
        .map(
          (c) =>
            `nombre: ${c.character.name}\nurl: ${
              'avatarUrl' in c.character
                ? c.character.avatarUrl
                : c.character.imageUrl
            }\ndescripcion: ${c.visual_description}`
        )
        .join('\n\n');

      const pagesWithIllustrationInfo = data.pages.map((text, index) => ({
        page_number: index + 1,
        text,
        illustration: illustratedPages.has(index) ? 'si' : 'no',
      }));

      const charactersForWebhook = data.characters.map(({ character }) => {
        const isPredefined = 'imageUrl' in character;
        const lang = 'es'; // Assuming Spanish for now for illustrate mode.

        const predefinedChar = isPredefined ? (character as PredefinedCharacter) : null;
        const userChar = !isPredefined ? (character as Character) : null;

        let species: string | undefined = '';
        if (predefinedChar) {
          species = predefinedChar.species[lang] || predefinedChar.species['es'];
        } else if (userChar && typeof userChar.species === 'object') {
          species = userChar.species[lang] || userChar.species['es'];
        } else if (userChar) {
          species = userChar.species;
        }

        return {
          name: character.name,
          species: species,
        };
      });

      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('readerName', data.readerName);
      formData.append('storyId', storyDocRef.id);
      formData.append('userId', user.uid);
      if (user.email) {
        formData.append('userEmail', user.email);
      }
      formData.append('characterImagesText', characterImagesText);
      formData.append('personalizacion', personalizacionText);
      formData.append('pages', JSON.stringify(pagesWithIllustrationInfo));
      formData.append('characters', JSON.stringify(charactersForWebhook));
      formData.append('initialPhrase', data.initialPhrase || '');
      formData.append('finalPhrase', data.finalPhrase || '');
      formData.append('language', data.language);

      if (data.backCoverImage) {
        formData.append('backCoverImage', data.backCoverImage);
      }

      // --- Call Webhook ---
      const response = await fetch(
        'https://natuai-n8n.kl7z6h.easypanel.host/webhook/7cd69962-5db3-4ff7-813e-3f493310a1c8',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error del webhook del servidor: ${response.status} - ${errorText}`
        );
      }

      toast({
        title: t('toastIllustrationGeneratingTitle'),
        description: t('toastIllustrationGeneratingDescription'),
      });

      illustrateForm.reset();
      setIllustratedPages(new Set());
      router.push('/perfil');
    } catch (error) {
      console.error('Error al enviar para ilustrar:', error);
      toast({
        variant: 'destructive',
        title: t('toastIllustrationErrorTitle'),
        description:
          error instanceof Error
            ? error.message
            : 'Hubo un problema al contactar el servidor.',
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
    <div
      className="container mx-auto max-w-5xl py-12"
      onFocus={handleFormInteraction}
    >
      <AuthPopup
        isOpen={isPopupOpen}
        onOpenChange={setPopupOpen}
        title={t('authPopupTitle')}
        description={t('authPopupDescription')}
        actionText={t('authPopupAction')}
        redirectPath="/registro"
      />
      <AlertDialog
        open={showGeneratingPopup}
        onOpenChange={setShowGeneratingPopup}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('generatingPopupTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('generatingPopupDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => router.push('/perfil')}>
              {t('generatingPopupAction')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Tabs defaultValue="create" className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="create">
              <Pencil className="mr-2 h-4 w-4" />
              {t('createTab')}
            </TabsTrigger>
            <TabsTrigger value="illustrate">
              <BookImage className="mr-2 h-4 w-4" />
              {t('illustrateTab')}
            </TabsTrigger>
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
                  <CardTitle className="text-2xl font-semibold">
                    {t('mainDataTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('storyTitleLabel')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('storyTitlePlaceholder')}
                            {...field}
                            onChange={(e) => {
                              const sanitizedValue = e.target.value.replace(/[^\p{L}\p{N}\s]/gu, '');
                              field.onChange(sanitizedValue);
                            }}
                            maxLength={35}
                          />
                        </FormControl>
                        <div className="flex justify-between">
                          <FormMessage />
                          <div className="text-xs text-right text-muted-foreground">
                            {watchedTitle.length}/35
                          </div>
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
                          <FormLabel>{t('readerAgeLabel')}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t('readerAgePlaceholder')}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="3-5">
                                {t('ageOption1')}
                              </SelectItem>
                              <SelectItem value="6-8">
                                {t('ageOption2')}
                              </SelectItem>
                              <SelectItem value="9-12">
                                {t('ageOption3')}
                              </SelectItem>
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
                            <FormLabel>{t('readerNameLabel')}</FormLabel>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t('readerNameTooltip')}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <FormControl>
                            <Input
                              placeholder={t('readerNamePlaceholder')}
                              {...field}
                              maxLength={20}
                              onChange={(e) => {
                                const sanitizedValue = e.target.value.replace(/[^\p{L}\p{N}\s]/gu, '');
                                field.onChange(sanitizedValue);
                              }}
                            />
                          </FormControl>
                          <div className="flex justify-between">
                            <FormMessage />
                            <div className="text-xs text-right text-muted-foreground">
                              {watchedReaderName.length}/20
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-2xl font-semibold">
                    {t('charactersTitle')}
                  </CardTitle>
                  <div className="w-fit bg-primary text-primary-foreground px-3 py-1 rounded-lg">
                    <p className="text-sm">{t('charactersDescription')}</p>
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
                                allSelectedCharacters={field.value.map(
                                  (c) => c.character
                                )}
                                onSelect={(character) => {
                                  const newCharacters = [...field.value];
                                  newCharacters[index] = {
                                    character,
                                    visual_description: '',
                                  };
                                  field.onChange(
                                    newCharacters.filter((c) => c !== undefined)
                                  );
                                }}
                                onRemove={() => {
                                  const newCharacters = field.value.filter(
                                    (_, i) => i !== index
                                  );
                                  field.onChange(newCharacters);
                                }}
                                onUpdateCustomization={(visual_description) => {
                                  const newCharacters = [...field.value];
                                  if (newCharacters[index]) {
                                    newCharacters[index].visual_description =
                                      visual_description;
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
                    <CardTitle className="text-2xl font-semibold">
                      {t('storyDetailsTitle')}
                    </CardTitle>
                    <div className="w-fit bg-primary text-primary-foreground px-3 py-1 rounded-lg">
                      <p className="text-sm">{t('storyDetailsSubtitle')}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-foreground p-3 bg-accent/20 border border-accent/50 rounded-lg">
                    {t('languageTip')}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('plotPointsLabel')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('plotPointsPlaceholder')}
                            rows={4}
                            maxLength={600}
                            {...field}
                          />
                        </FormControl>
                        <p className="text-sm text-destructive mt-2">{t('importantCharacterNote')}</p>
                        <div className="flex justify-between">
                          <FormMessage />
                          <div className="text-xs text-right text-muted-foreground">
                            {(watchedPrompt || '').length}/600
                          </div>
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
                          <FormLabel>{t('learningObjectiveLabel')}</FormLabel>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                size="sm"
                                className="bg-accent text-accent-foreground hover:bg-accent/90"
                              >
                                <Lightbulb className="mr-2 h-4 w-4" />
                                {t('ideasButton')}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {Object.values(learningObjectiveSuggestions).map(
                                (suggestion, index) => (
                                  <DropdownMenuItem
                                    key={index}
                                    onSelect={() =>
                                      form.setValue(
                                        'learningObjective',
                                        t(
                                          `learningObjectiveSuggestions.${suggestion}`
                                        )
                                      )
                                    }
                                  >
                                    {t(
                                      `learningObjectiveSuggestions.${suggestion}`
                                    )}
                                  </DropdownMenuItem>
                                )
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <FormControl>
                          <Textarea
                            placeholder={t('learningObjectivePlaceholder')}
                            maxLength={200}
                            {...field}
                          />
                        </FormControl>
                        <div className="flex justify-between">
                          <FormMessage />
                          <div className="text-xs text-right text-muted-foreground">
                            {(watchedLearningObjective || '').length}/200
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imageCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('imageCountLabel')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t('imageCountPlaceholder')}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="4">
                              {t('imageOption1')}
                            </SelectItem>
                             <SelectItem value="11">
                              {t('imageOption4')}
                            </SelectItem>
                            <SelectItem value="12">
                              {t('imageOption2')}
                            </SelectItem>
                            <SelectItem value="20">
                              {t('imageOption3')}
                            </SelectItem>
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
                  <CardTitle className="text-2xl font-semibold">
                    {t('magicalTouchesTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4 rounded-lg border bg-card-foreground/5 p-4">
                    <div className="flex items-center space-x-3">
                      <Switch
                        id="show-dedication"
                        checked={showDedication}
                        onCheckedChange={setShowDedication}
                      />
                      <FormLabel
                        htmlFor="show-dedication"
                        className="text-base font-semibold cursor-pointer"
                      >
                        {t('addDedicationLabel')}
                      </FormLabel>
                    </div>
                    {showDedication && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 animate-in fade-in-0 duration-300">
                        <FormField
                          control={form.control}
                          name="initialPhrase"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('initialPhraseLabel')}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t('initialPhrasePlaceholder')}
                                  {...field}
                                  maxLength={500}
                                />
                              </FormControl>
                              <div className="flex justify-between">
                                <FormMessage />
                                <div className="text-xs text-right text-muted-foreground">
                                  {(watchedInitialPhrase || '').length}/500
                                </div>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="finalPhrase"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('finalPhraseLabel')}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t('finalPhrasePlaceholder')}
                                  {...field}
                                  maxLength={500}
                                />
                              </FormControl>
                              <div className="flex justify-between">
                                <FormMessage />
                                <div className="text-xs text-right text-muted-foreground">
                                  {(watchedFinalPhrase || '').length}/500
                                </div>
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
                      <FormLabel
                        htmlFor="show-back-cover-image"
                        className="text-base font-semibold cursor-pointer"
                      >
                        {t('backCoverImageLabel')}
                      </FormLabel>
                    </div>
                    {showBackCoverImage && (
                      <div className="pt-4 animate-in fade-in-0 duration-300">
                        <FormField
                          control={form.control}
                          name="backCoverImage"
                          render={() => (
                            <FormItem>
                              <FormLabel>{t('backCoverUploadLabel')}</FormLabel>
                              <FormControl>
                                <div className="flex items-center gap-4">
                                  <label
                                    htmlFor="back-cover-upload"
                                    className="cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2 rounded-md border border-input px-4 py-2 hover:bg-accent">
                                      <PlusCircle className="h-4 w-4" />
                                      <span>
                                        {backCoverPreview
                                          ? t('backCoverChangeText')
                                          : t('backCoverUploadText')}
                                      </span>
                                    </div>

                                    <input
                                      id="back-cover-upload"
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) =>
                                        handleBackCoverImageChange(e, 'create')
                                      }
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
                  <CardTitle className="text-2xl font-semibold">
                    {t('languageTitle')}
                  </CardTitle>
                  <div className="mt-2 text-sm text-foreground p-3 bg-white border border-destructive rounded-lg">
                    {t('languageWarning')}
                  </div>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('languageLabel')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t('languagePlaceholder')}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="es">
                              {t('languageEs')}
                            </SelectItem>
                            <SelectItem value="en">
                              {t('languageEn')}
                            </SelectItem>
                            <SelectItem value="fr">
                              {t('languageFr')}
                            </SelectItem>
                            <SelectItem value="it">
                              {t('languageIt')}
                            </SelectItem>
                            <SelectItem value="de">
                              {t('languageDe')}
                            </SelectItem>
                            <SelectItem value="pt">
                              {t('languagePt')}
                            </SelectItem>
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
                    {t('totalCost', { credits: totalCredits })}
                  </span>
                </Card>
                <Button
                  type="submit"
                  size="lg"
                  className="shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/50 hover:-translate-y-0.5"
                  disabled={
                    isSubmitting || totalCredits === 0 || isStoryGenerating
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {t('generatingButton')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      {t('createStoryButton')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="illustrate">
          <Form {...illustrateForm}>
            <form
              onSubmit={illustrateForm.handleSubmit(onIllustrateSubmit)}
              className="space-y-10"
            >
              <Card className="shadow-lg">
                <CardContent className="space-y-6 pt-6">
                  <FormField
                    control={illustrateForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('storyTitleLabel')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('storyTitlePlaceholder')}
                            {...field}
                            maxLength={35}
                            onChange={(e) => {
                                const sanitizedValue = e.target.value.replace(/[^\p{L}\p{N}\s]/gu, '');
                                field.onChange(sanitizedValue);
                            }}
                          />
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
                          <FormLabel>{t('readerNameLabel')}</FormLabel>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t('readerNameTooltip')}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <FormControl>
                          <Input
                            placeholder={t('readerNamePlaceholder')}
                            {...field}
                            maxLength={20}
                             onChange={(e) => {
                                const sanitizedValue = e.target.value.replace(/[^\p{L}\p{N}\s]/gu, '');
                                field.onChange(sanitizedValue);
                            }}
                          />
                        </FormControl>
                        <div className="flex justify-between">
                          <FormMessage />
                          <div className="text-xs text-right text-muted-foreground">
                            {(illustrateWatchedReaderName || '').length}/20
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-2xl font-semibold">
                    {t('charactersTitle')}
                  </CardTitle>
                  <div className="w-fit bg-primary text-primary-foreground px-3 py-1 rounded-lg">
                    <p className="text-sm">{t('charactersDescription')}</p>
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
                                allSelectedCharacters={field.value.map(
                                  (c) => c.character
                                )}
                                onSelect={(character) => {
                                  const newCharacters = [...field.value];
                                  newCharacters[index] = {
                                    character,
                                    visual_description: '',
                                  };
                                  field.onChange(
                                    newCharacters.filter((c) => c !== undefined)
                                  );
                                }}
                                onRemove={() => {
                                  const newCharacters = field.value.filter(
                                    (_, i) => i !== index
                                  );
                                  field.onChange(newCharacters);
                                }}
                                onUpdateCustomization={(visual_description) => {
                                  const newCharacters = [...field.value];
                                  if (newCharacters[index]) {
                                    newCharacters[index].visual_description =
                                      visual_description;
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
                  <CardTitle className="text-2xl font-semibold">
                    {t('illustratePagesTitle')}
                  </CardTitle>
                  <Alert className="bg-yellow-100 border-yellow-300 text-yellow-800">
                    <Sparkles className="h-4 w-4 !text-yellow-800" />
                    <AlertTitle>{t('illustratePagesAlertTitle')}</AlertTitle>
                    <AlertDescription>
                      {t('illustratePagesAlertDescription')}
                    </AlertDescription>
                  </Alert>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormItem>
                    <FormLabel>{t('pageCountLabel')}</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        setNumberOfPages(parseInt(value, 10))
                      }
                      defaultValue={String(numberOfPages)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t('pageCountPlaceholder')}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 15 }, (_, i) => 6 + i).map(
                          (num) => (
                            <SelectItem key={num} value={String(num)}>
                              {num} {t('pagesText')}
                            </SelectItem>
                          )
                        )}
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
                              <FormLabel>
                                {t('pageLabel', { number: index + 1 })}
                              </FormLabel>
                              <div className="flex items-center gap-2">
                                <label
                                  htmlFor={`illustrate-switch-${index}`}
                                  className="text-sm font-medium text-primary"
                                >
                                  {t('illustrateToggle')}
                                </label>
                                <Switch
                                  id={`illustrate-switch-${index}`}
                                  checked={illustratedPages.has(index)}
                                  onCheckedChange={() =>
                                    handleIllustrationToggle(index)
                                  }
                                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-500 data-[state=checked]:to-yellow-500"
                                />
                              </div>
                            </div>
                            <FormControl>
                              <Textarea
                                placeholder={t('pageTextPlaceholder', {
                                  number: index + 1,
                                })}
                                {...field}
                                onChange={(e) => {
                                  const sanitizedValue = e.target.value.replace(/\n\n+/g, '\n');
                                  field.onChange(sanitizedValue);
                                }}
                                rows={6}
                                maxLength={1000}
                              />
                            </FormControl>
                            <div className="flex justify-between">
                                <FormMessage />
                                <div className="text-xs text-right text-muted-foreground">
                                    {(watchedIllustratePages?.[index] || '').length}/1000
                                </div>
                            </div>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">
                    {t('magicalTouchesTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4 rounded-lg border bg-card-foreground/5 p-4">
                    <div className="flex items-center space-x-3">
                      <Switch
                        id="illustrate-show-dedication"
                        checked={showDedication}
                        onCheckedChange={setShowDedication}
                      />
                      <FormLabel
                        htmlFor="illustrate-show-dedication"
                        className="text-base font-semibold cursor-pointer"
                      >
                        {t('addDedicationLabel')}
                      </FormLabel>
                    </div>
                    {showDedication && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 animate-in fade-in-0 duration-300">
                        <FormField
                          control={illustrateForm.control}
                          name="initialPhrase"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('initialPhraseLabel')}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t('initialPhrasePlaceholder')}
                                  {...field}
                                  maxLength={500}
                                />
                              </FormControl>
                              <div className="flex justify-between">
                                <FormMessage />
                                <div className="text-xs text-right text-muted-foreground">
                                  {
                                    (illustrateWatchedInitialPhrase || '')
                                      .length
                                  }
                                  /500
                                </div>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={illustrateForm.control}
                          name="finalPhrase"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('finalPhraseLabel')}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t('finalPhrasePlaceholder')}
                                  {...field}
                                  maxLength={500}
                                />
                              </FormControl>
                              <div className="flex justify-between">
                                <FormMessage />
                                <div className="text-xs text-right text-muted-foreground">
                                  {(illustrateWatchedFinalPhrase || '')
                                    .length}
                                  /500
                                </div>
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
                      <FormLabel
                        htmlFor="illustrate-show-back-cover-image"
                        className="text-base font-semibold cursor-pointer"
                      >
                        {t('backCoverImageLabel')}
                      </FormLabel>
                    </div>
                    {showBackCoverImage && (
                      <div className="pt-4 animate-in fade-in-0 duration-300">
                        <FormField
                          control={illustrateForm.control}
                          name="backCoverImage"
                          render={() => (
                            <FormItem>
                              <FormLabel>
                                {t('backCoverUploadLabel')}
                              </FormLabel>
                              <FormControl>
                                <div className="flex items-center gap-4">
                                  <label
                                    htmlFor="illustrate-back-cover-upload"
                                    className="cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2 rounded-md border border-input px-4 py-2 hover:bg-accent">
                                      <PlusCircle className="h-4 w-4" />
                                      <span>
                                        {backCoverPreview
                                          ? t('backCoverChangeText')
                                          : t('backCoverUploadText')}
                                      </span>
                                    </div>

                                    <input
                                      id="illustrate-back-cover-upload"
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) =>
                                        handleBackCoverImageChange(
                                          e,
                                          'illustrate'
                                        )
                                      }
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
                  <CardTitle className="text-2xl font-semibold">
                     {t('illustrateLanguageTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={illustrateForm.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('languageLabel')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t('languagePlaceholder')}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="es">
                              {t('languageEs')}
                            </SelectItem>
                            <SelectItem value="en">
                              {t('languageEn')}
                            </SelectItem>
                            <SelectItem value="fr">
                              {t('languageFr')}
                            </SelectItem>
                            <SelectItem value="it">
                              {t('languageIt')}
                            </SelectItem>
                            <SelectItem value="de">
                              {t('languageDe')}
                            </SelectItem>
                            <SelectItem value="pt">
                              {t('languagePt')}
                            </SelectItem>
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
                    {t('totalCost', { credits: illustrateCredits })}
                  </span>
                </Card>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting || isStoryGenerating}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <BookImage className="mr-2 h-5 w-5" />
                  )}
                  {t('illustrateButton')}
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
