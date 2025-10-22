
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import AuthPopup from '@/components/core/AuthPopup';
import { useParams } from 'next/navigation';

const categoryDetails: { [key: string]: { title: string, description: string } } = {
    'ilustrado-20': { title: 'Cuento 100% Ilustrado', description: 'Rellena los detalles para tu cuento con 20 ilustraciones y portada.' },
    'ilustrado-12': { title: 'Cuento Ilustrado', description: 'Rellena los detalles para tu cuento con 12 ilustraciones y portada.' },
    'ilustrado-5': { title: 'Cuento con Imágenes', description: 'Rellena los detalles para tu cuento con 5 ilustraciones y portada.' },
    'solo-portada': { title: 'Cuento sin Ilustraciones', description: 'Rellena los detalles para tu cuento (solo portada).' },
};


export default function CrearCuentoPage() {
  const { user, isUserLoading } = useUser();
  const [isPopupOpen, setPopupOpen] = useState(false);
  const params = useParams();
  const categoria = Array.isArray(params.categoria) ? params.categoria[0] : params.categoria;

  const details = categoryDetails[categoria] || { title: 'Crea Tu Próximo Cuento', description: 'Rellena los detalles y deja que la magia haga el resto.'};

  const handleInteraction = () => {
    if (!user && !isUserLoading) {
      setPopupOpen(true);
    }
  };
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
        handleInteraction();
        return;
    }
    
    // Aquí iría la lógica para llamar al webhook correspondiente según `categoria`
    alert(`Generando cuento para la categoría: ${categoria}`);
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
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="title" className="text-lg font-semibold">
                Título del Cuento
              </Label>
              <Input
                id="title"
                placeholder="El misterio del bosque encantado"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="objective" className="text-lg font-semibold">
                Objetivo de Aprendizaje
              </Label>
              <Textarea
                id="objective"
                placeholder="Ej: Enseñar la importancia de la amistad y el trabajo en equipo."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="age" className="text-lg font-semibold">
                  Edad del Lector
                </Label>
                <Select>
                  <SelectTrigger id="age">
                    <SelectValue placeholder="Selecciona una edad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3-5">3-5 años</SelectItem>
                    <SelectItem value="6-8">6-8 años</SelectItem>
                    <SelectItem value="9-12">9-12 años</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="reader-name"
                  className="text-lg font-semibold"
                >
                  Nombre del Lector (Opcional)
                </Label>
                <Input id="reader-name" placeholder="Leo" />
              </div>
            </div>
            <div>
              <Label className="text-lg font-semibold mb-2 block">
                Personajes (hasta 4)
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Personaje 1: Un zorro astuto llamado Fígaro" />
                <Input placeholder="Personaje 2: Una osa sabia llamada Úrsula" />
                <Input placeholder="Personaje 3" />
                <Input placeholder="Personaje 4" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-lg font-semibold">
                Puntos Clave de la Trama
              </Label>
              <Textarea
                id="prompt"
                placeholder="Describe los eventos principales, giros o el mensaje que quieres transmitir."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="start-phrase"
                  className="text-lg font-semibold"
                >
                  Frase Inicial (Opcional)
                </Label>
                <Input
                  id="start-phrase"
                  placeholder="Érase una vez en un reino muy lejano..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-phrase" className="text-lg font-semibold">
                  Frase Final (Opcional)
                </Label>
                <Input
                  id="end-phrase"
                  placeholder="...y vivieron felices para siempre."
                />
              </div>
            </div>
            <div className="text-center pt-4">
              <Button
                type="submit"
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 z-20 relative"
              >
                Generar mi Cuento <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
