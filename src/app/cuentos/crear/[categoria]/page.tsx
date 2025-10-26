
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { addDoc } from 'firebase/firestore';
import { userStoriesCollectionRef } from '@/firebase/firestore/references';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, CreditCard, Info, PlusCircle, BookHeart } from 'lucide-react';
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
import { CharacterWithCustomization } from '../components/types';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';
import { serverTimestamp } from 'firebase/firestore';

const categoryDetails: {
  [key: string]: { title: string; description: string; };
} = {
  'aprendizaje': {
    title: '¡Crea un cuento!',
    description:
      'Rellena los detalles para tu cuento con ilustraciones y portada.',
  },
};

const webhookUrls: { [key: string]: string } = {
  '0': 'https://natuai-n8n.kl7z6h.easypanel.host/webhook/0d6ca372-f43f-4027-a346-26fe38f0979d',
  '12': 'https://natuai-n8n.kl7z6h.easypanel.host/webhook/45129045-1e5b-4f16-b77d-17c2670279db',
  '20': 'https://natuai-n8n.kl7z6h.easypanel.host/webhook/96e4c11c-9ae5-4dc3-b075-23bc7cbe47c3',
};

const creditCosts = {
  images: {
    '0': 400,
    '12': 1500,
    '20': 2400,
  },
  customization: 100,
};

const formSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio.'),
  learningObjective: z.string().optional(),
  readerAge: z.string().min(1, 'La edad es obligatoria.'),
  readerName: z.string().min(1, 'El nombre del lector es obligatorio.'),
  imageCount: z.string().min(1, 'Debes seleccionar un número de imágenes.'),
  prompt: z.string().optional(),
  initialPhrase: z.string().optional(),
  finalPhrase: z.string().optional(),
  characters: z.array(z.custom<CharacterWithCustomization>()).min(1, 'Debes seleccionar al menos un personaje.').max(4, 'Puedes seleccionar hasta 4 personajes.'),
  backCoverImage: z.instanceof(File).optional(),
});

type StoryFormValues = z.infer<typeof formSchema>;

export default function CrearCuentoPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDedication, setShowDedication] = useState(false);
  const [showBackCoverImage, setShowBackCoverImage] = useState(false);
  const [backCoverPreview, setBackCoverPreview] = useState<string | null>(null);
  const [totalCredits, setTotalCredits] = useState(0);
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const categoria = Array.isArray(params.categoria)
    ? params.categoria[0]
    : params.categoria;

  const details = categoryDetails[categoria] || {
    title: '¡Crea un cuento!',
    description: 'Rellena los detalles y deja que la magia haga el resto.',
  };

  const form = useForm<StoryFormValues>({
    resolver: zodResolver(formSchema),
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
    },
  });

  const watchedImageCount = form.watch('imageCount');
  const watchedCharacters = form.watch('characters');

  useEffect(() => {
    let credits = 0;
    
    // Calculate credits for images
    if (watchedImageCount && creditCosts.images[watchedImageCount as keyof typeof creditCosts.images]) {
      credits += creditCosts.images[watchedImageCount as keyof typeof creditCosts.images];
    }

    // Calculate credits for character customizations
    if (watchedCharacters) {
      const customizationCount = watchedCharacters.filter(c => c && c.visual_description).length;
      credits += customizationCount * creditCosts.customization;
    }
    
    setTotalCredits(credits);
  }, [watchedImageCount, watchedCharacters]);


  const handleInteraction = () => {
    if (!user && !isUserLoading) {
      setPopupOpen(true);
    }
  };

  const handleBackCoverImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('backCoverImage', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      form.setValue('backCoverImage', undefined);
      setBackCoverPreview(null);
    }
  };

  async function onSubmit(data: StoryFormValues) {
    if (!user || !firestore) {
      handleInteraction();
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
    
    const characterImagesText = data.characters
      .filter(c => !c.visual_description)
      .map(c => {
        const baseCharacter = c.character;
        const imageUrl = 'avatarUrl' in baseCharacter ? baseCharacter.avatarUrl : baseCharacter.imageUrl;
        return `${baseCharacter.name}:\n${imageUrl}`;
    }).join('\n\n');
    
    const charactersForWebhook = data.characters.map(({ character, visual_description }) => {
      const { avatarUrl, imageUrl, createdAt, id, ...restOfCharacter } = character as any;
      return { character: restOfCharacter, visual_description };
    });

    try {
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
          characters: charactersForWebhook, // Simplified characters for Firestore
          status: 'generating',
          createdAt: serverTimestamp(),
          coverImageUrl: '',
          pdfUrl: ''
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
    } finally {
        setIsSubmitting(false);
    }
  }

  if (isUserLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-12">
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
    <div className="container mx-auto max-w-4xl py-12">
      <AuthPopup
        isOpen={isPopupOpen}
        onOpenChange={setPopupOpen}
        title="Regístrate para crear tu cuento"
        description="¡Regístrate y comienza a generar tus propias historias!"
        actionText="Registrarse"
        redirectPath="/registro"
      />
      <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl text-gray-800">
            {details.title}
          </h1>
          <p className="max-w-xl mx-auto text-lg text-muted-foreground mt-2">
            {details.description}
          </p>
      </div>

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
                      />
                    </FormControl>
                    <FormMessage />
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
                        <Input placeholder="Leo" {...field} />
                      </FormControl>
                      <FormMessage />
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
                <CardTitle className="text-2xl font-semibold">3. Detalles de la historia</CardTitle>
                 <CardDescription>Añade los toques finales para que tu cuento sea único.</CardDescription>
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
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="learningObjective"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Objetivo de Aprendizaje (Opcional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: Enseñar la importancia de la amistad y el trabajo en equipo."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
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
                            <SelectItem value="0">0 imágenes (400cd)</SelectItem>
                            <SelectItem value="12">12 imágenes (1.500cd)</SelectItem>
                            <SelectItem value="20">20 imágenes (2.400cd)</SelectItem>
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
                              />
                            </FormControl>
                            <FormMessage />
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
                              />
                            </FormControl>
                            <FormMessage />
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
                                render={({ field }) => (
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
                                                        onChange={handleBackCoverImageChange} 
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
                        Coste Total: {totalCredits.toLocaleString()} créditos
                    </span>
                </Card>
                <Button
                  type="submit"
                  size="lg"
                  className="shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/50 hover:-translate-y-0.5"
                  disabled={isSubmitting || totalCredits === 0}
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
    </div>
  );
}


    
    
