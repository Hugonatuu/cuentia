'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { predefinedCharacters } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { userCharactersCollectionRef } from '@/firebase/firestore/references';
import { Skeleton } from '@/components/ui/skeleton';

interface Character {
  id: string;
  name: string;
  avatarUrl: string;
}

export default function PersonajesPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userCharactersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return userCharactersCollectionRef(firestore, user.uid);
  }, [firestore, user]);

  const { data: userCharacters, isLoading: areCharactersLoading } = useCollection<Character>(userCharactersQuery);

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl text-gray-800">
          Un Mundo de Personajes
        </h1>
        <p className="max-w-3xl mx-auto text-lg text-muted-foreground mt-4">
          Elige entre nuestros personajes listos para la aventura o crea los
          tuyos propios. ¡La magia está en tus manos!
        </p>
      </div>

      {!isUserLoading && !user && (
         <Card className="mb-12 bg-accent/20 border-accent/50">
            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-center text-center md:text-left gap-6">
                <p className="text-lg font-medium text-accent-foreground/90">
                    ¿Quieres crear tus propios protagonistas? <br/>Regístrate para dar vida a tus ideas.
                </p>
                <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
                    <Link href="/registro">Crear Personaje</Link>
                </Button>
            </CardContent>
         </Card>
      )}

      {user && (
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Mis Personajes</h2>
          {areCharactersLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
               {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-auto w-full aspect-square" />
                  <Skeleton className="h-6 w-3/4 mx-auto" />
                </div>
              ))}
            </div>
          ) : userCharacters && userCharacters.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {userCharacters.map((character) => (
                <Card
                  key={character.id}
                  className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
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
                    <div className="py-3 px-2">
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
                ¡Dirígete a la sección de "Crear Personaje" para empezar a dar vida a
                tus protagonistas!
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {predefinedCharacters.map((character) => (
            <Card
              key={character.id}
              className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <CardContent className="p-0 text-center">
                <div className="aspect-square overflow-hidden">
                  <Image
                    src={character.image.imageUrl}
                    alt={character.name}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    data-ai-hint={character.image.imageHint}
                  />
                </div>
                <div className="py-3 px-2">
                  <h3 className="font-semibold text-md">{character.name}</h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
