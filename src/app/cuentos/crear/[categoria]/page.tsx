'use client';

import { useState } from 'react';
import { useUser } from '@/firebase';
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
import { Loader2, Sparkles } from 'lucide-react';
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

const categoryDetails: {
  [key: string]: { title: string; description: string; webhook: string };
} = {
  'ilustrado-20': {
    title: 'Cuento 100% Ilustrado',
    description:
      'Rellena los detalles para tu cuento con 20 ilustraciones y portada.',
    webhook:
      'https://natuai-n8n.kl7z6h.easypanel.host/webhook/b964948a-a957-484c-86e5-0e1291880479',
  },
  'ilustrado-12': {
    title: 'Cuento Ilustrado',
    description:
      'Rellena los detalles para tu cuento con 12 ilustraciones y portada.',
    webhook:
      'https://natuai-n8n.kl7z6h.easypanel.host/webhook/45129045-1e5b-4f16-b77d-17c2670279db',
  },
  'ilustrado-5': {
    title: 'Cuento con Imágenes',
    description: 'Rellena los detalles para tu cuento con 5 ilustraciones y portada.',
    webhook:
      'https://natuai-n8n.kl7z6h.easypanel.host/webhook/989189b6-b519-482d-89c0-6d4b96f5b9d2',
  },
  'solo-portada': {
    title: 'Cuento sin Ilustraciones',
    description: 'Rellena los detalles para tu cuento (solo portada).',
    webhook:
      'https://natuai-n8n.kl7z6h.easypanel.host/webhook/166669c2-7b24-4f8a-92ab-426b38c2901c',
  },
};

const formSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio.'),
  learningObjective: z.string().min(1, 'El objetivo de aprendizaje es obligatorio.'),
  readerAge: z.string().min(1, 'La edad es obligatoria.'),
  readerName: z.string().optional(),
  prompt: z.string().min(1, 'La trama es obligatoria.'),
  initialPhrase: z.string().optional(),
  finalPhrase: z.string().optional(),
  characters: z.array(z.custom<CharacterWithCustomization>()).min(1, 'Debes seleccionar al menos un personaje.').max(4, 'Puedes seleccionar hasta 4 personajes.'),
});

type StoryFormValues = z.infer<typeof formSchema>;

export default function CrearCuentoPage() {
  const { user, isUserLoading } = useUser();
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const categoria = Array.isArray(params.categoria)
    ? params.categoria[0]
    : params.categoria;

  const details = categoryDetails[categoria] || {
    title: 'Crea Tu Próximo Cuento',
    description: 'Rellena los detalles y deja que la magia haga el resto.',
    webhook: '',
  };

  const form = useForm<StoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      learningObjective: '',
      readerAge: '',
      readerName: '',
      prompt: '',
      initialPhrase: '',
      finalPhrase: '',
      characters: [],
    },
  });

  const handleInteraction = () => {
    if (!user && !isUserLoading) {
      setPopupOpen(true);
    }
  };

  async function onSubmit(data: StoryFormValues) {
    if (!user) {
      handleInteraction();
      return;
    }

    if (!details.webhook) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'La categoría seleccionada no tiene un webhook configurado.',
        });
        return;
    }

    setIsSubmitting(true);
    
    const characterImagesText = data.characters.map(c => {
        const baseCharacter = c.character;
        const imageUrl = 'avatarUrl' in baseCharacter ? baseCharacter.avatarUrl : baseCharacter.imageUrl;
        return `${baseCharacter.name}:\n${imageUrl}`;
    }).join('\n\n');
    
    const charactersForWebhook = data.characters.map(({ character, customization }) => {
      const { avatarUrl, imageUrl, createdAt, id, ...restOfCharacter } = character as any;
      return { character: restOfCharacter, customization };
    });

    const webhookData = {
        ...data,
        userId: user.uid,
        characterImagesText: characterImagesText,
        characters: charactersForWebhook,
    };

    try {
        const response = await fetch(details.webhook, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookData),
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
        router.push('/cuentos/mis-cuentos');

    } catch (error) {
        console.error('Error al llamar al webhook:', error);
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
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <Skeleton className="h-12 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-52" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-6 w-44" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-6 w-44" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="text-center pt-4">
              <Skeleton className="h-12 w-48 mx-auto" />
            </div>
          </CardContent>
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
      <Card className="shadow-lg relative">
        {!isUserLoading && !user && (
          <div
            className="absolute inset-0 z-10 bg-transparent cursor-pointer"
            onClick={handleInteraction}
          />
        )}
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-4xl md:text-5xl text-gray-800">
            {details.title}
          </CardTitle>
          <CardDescription className="text-lg">
            {details.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">
                      Título del Cuento
                    </FormLabel>
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

              <FormField
                control={form.control}
                name="learningObjective"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">
                      Objetivo de Aprendizaje
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="readerAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">
                        Edad del Lector
                      </FormLabel>
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
                      <FormLabel className="text-lg font-semibold">
                        Nombre del Lector (Opcional)
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Leo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <FormField
                control={form.control}
                name="characters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">Personajes (1-4)</FormLabel>
                     <FormControl>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, index) => (
                                <CharacterSlot
                                    key={index}
                                    characterWithCustomization={field.value[index]}
                                    allSelectedCharacters={field.value.map(c => c.character)}
                                    onSelect={(character) => {
                                        const newCharacters = [...field.value];
                                        newCharacters[index] = { character, customization: '' };
                                        field.onChange(newCharacters.filter(c => c !== undefined));
                                    }}
                                    onRemove={() => {
                                        const newCharacters = field.value.filter((_, i) => i !== index);
                                        field.onChange(newCharacters);
                                    }}
                                    onUpdateCustomization={(customization) => {
                                      const newCharacters = [...field.value];
                                      if (newCharacters[index]) {
                                        newCharacters[index].customization = customization;
                                        field.onChange(newCharacters);
                                      }
                                    }}
                                />
                            ))}
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">
                      Puntos Clave de la Trama
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe los eventos principales, giros o el mensaje que quieres transmitir."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="initialPhrase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">
                        Frase Inicial (Opcional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Érase una vez en un reino muy lejano..."
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
                      <FormLabel className="text-lg font-semibold">
                        Frase Final (Opcional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="...y vivieron felices para siempre."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="text-center pt-4">
                <Button
                  type="submit"
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 z-20 relative"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      Generar mi Cuento <Sparkles className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
