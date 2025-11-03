
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { userCharactersCollectionRef, predefinedCharactersCollectionRef } from '@/firebase/firestore/references';
import { Skeleton } from '@/components/ui/skeleton';
import { X, Info, Sparkles, Cat, User as UserIcon, Star } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { doc } from 'firebase/firestore';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

interface Character {
  id: string;
  name: string;
  avatarUrl: string;
  species: string;
  gender: string;
  age: string;
}

type Category = 'Christmas' | 'Animal' | 'Fantasy' | 'Humans' | 'Other';

interface PredefinedCharacter {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  species: string;
  gender: string;
  age: string;
  category: Category;
}

const categories: { name: Category | 'All'; icon: React.ElementType }[] = [
    { name: 'Fantasy', icon: Sparkles },
    { name: 'Animal', icon: Cat },
    { name: 'Humans', icon: UserIcon },
    { name: 'Christmas', icon: Star },
    { name: 'Other', icon: Info },
];


export default function PersonajesPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');

  const userCharactersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return userCharactersCollectionRef(firestore, user.uid);
  }, [firestore, user]);

  const predefinedCharactersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return predefinedCharactersCollectionRef(firestore);
  }, [firestore]);

  const { data: userCharacters, isLoading: areCharactersLoading } = useCollection<Character>(userCharactersQuery);
  const { data: predefinedCharacters, isLoading: arePredefinedCharactersLoading } = useCollection<PredefinedCharacter>(predefinedCharactersQuery);

  const handleDeleteClick = (character: Character) => {
    setCharacterToDelete(character);
  };

  const confirmDelete = () => {
    if (characterToDelete && firestore && user) {
      const characterDocRef = doc(firestore, `customers/${user.uid}/characters/${characterToDelete.id}`);
      deleteDocumentNonBlocking(characterDocRef);
    }
    setCharacterToDelete(null);
  };

  const filteredPredefinedCharacters = selectedCategory === 'All'
    ? predefinedCharacters
    : predefinedCharacters?.filter(char => char.category === selectedCategory);


  return (
    <div className="container mx-auto py-12">
       <AlertDialog open={!!characterToDelete} onOpenChange={(isOpen) => !isOpen && setCharacterToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el personaje
              "{characterToDelete?.name}" de tus datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCharacterToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl text-gray-800">
          Un Mundo de Personajes
        </h1>
        <p className="max-w-3xl mx-auto text-primary mt-4 font-body">
          Aquí viven los personajes que darán vida a tus historias. ¡Crea nuevos amigos, a ti mismo o incluso a tu mascota!
        </p>
      </div>

      {!isUserLoading && !user && (
         <Card className="mb-12 bg-accent/20 border-accent/50">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4">
                 <p className="text-lg font-medium text-accent-foreground/90">
                    Sube una foto tuya, de tu mascota, o de quien tu quieras y crea un personaje único.
                </p>
                <p className="text-lg font-medium text-accent-foreground/90">
                    💫¡Regístrate y deja que la magia comience! 💫
                </p>
                <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
                    <Link href="/registro">Crear Personaje</Link>
                </Button>
            </CardContent>
         </Card>
      )}

      {user && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Mis Personajes</h2>
            <Button asChild>
                <Link href="/crear-personaje">✨ Crear Nuevo Personaje ✨</Link>
            </Button>
          </div>
          {areCharactersLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
               {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-auto w-full aspect-square rounded-lg" />
                  <Skeleton className="h-6 w-3/4 mx-auto" />
                </div>
              ))}
            </div>
          ) : userCharacters && userCharacters.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {userCharacters.map((character) => (
                <Card
                  key={character.id}
                  className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative border-2 border-accent"
                >
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteClick(character)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Eliminar personaje</span>
                  </Button>
                  <CardContent className="p-0 text-center">
                    <div className="aspect-square overflow-hidden">
                      <Image
                        src={character.avatarUrl}
                        alt={character.name}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div className="py-3 px-2 bg-accent text-accent-foreground">
                      <h3 className="font-semibold text-md">{character.name}</h3>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <h2 className="text-xl font-semibold text-gray-700">
                Aún no has creado ningún personaje
              </h2>
              <p className="text-muted-foreground mt-2 mb-4">
                Tu historia está esperando a su protagonista. ¡Crea el primero y deja que la magia comience!
              </p>
              <Button asChild>
                <Link href="/crear-personaje">Crear mi primer personaje</Link>
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Personajes Predefinidos</h2>

        <div className="mb-8 flex flex-wrap justify-center gap-2 md:gap-4">
            <Button
                variant={selectedCategory === 'All' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('All')}
                className="rounded-full"
            >
                Todos
            </Button>
          {categories.map(({ name, icon: Icon }) => (
            <Button
              key={name}
              variant={selectedCategory === name ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(name)}
              className="rounded-full"
            >
              <Icon className="mr-2 h-4 w-4" />
              {name}
            </Button>
          ))}
        </div>

         {arePredefinedCharactersLoading ? (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
               {[...Array(10)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-auto w-full aspect-square rounded-lg" />
                  <Skeleton className="h-6 w-3/4 mx-auto" />
                </div>
              ))}
            </div>
         ) : filteredPredefinedCharacters && filteredPredefinedCharacters.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredPredefinedCharacters.map((character) => (
                <TooltipProvider key={character.id}>
                  <Tooltip>
                    <Card
                      className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 border-accent"
                    >
                      <TooltipTrigger asChild>
                        <CardContent className="p-0 text-center relative">
                            <Info className="absolute top-2 right-2 h-5 w-5 text-white bg-black/50 rounded-full p-1 z-10" />
                            <div className="aspect-square overflow-hidden">
                              <Image
                                src={character.imageUrl}
                                alt={character.name}
                                width={400}
                                height={400}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                data-ai-hint={character.imageHint}
                              />
                            </div>
                            <div className="py-3 px-2 bg-accent text-accent-foreground">
                              <h3 className="font-semibold text-md">{character.name}</h3>
                            </div>
                        </CardContent>
                      </TooltipTrigger>
                    </Card>
                     <TooltipContent>
                      <p className="max-w-xs">{character.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
         ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <h2 className="text-xl font-semibold text-gray-700">
                    No hay personajes en esta categoría
                </h2>
                <p className="text-muted-foreground mt-2">
                    Pronto habrá más personajes listos para la aventura.
                </p>
            </div>
         )}
      </div>
    </div>
  );
}
