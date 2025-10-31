
'use client';

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/[locale]/components/ui/card";
import { Button } from "@/app/[locale]/components/ui/button";
import { BookOpen } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from '@/app/[locale]/firebase';
import { communityStoriesCollectionRef } from '@/app/[locale]/firebase/firestore/references';
import { Skeleton } from "@/app/[locale]/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/app/[locale]/components/ui/alert";

interface CommunityStory {
  id: string;
  title: string;
  coverImageUrl: string;
  pdfUrl: string;
}

export default function ComunidadPage() {
  const firestore = useFirestore();
  
  const communityStoriesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return communityStoriesCollectionRef(firestore);
  }, [firestore]);

  const { data: stories, isLoading, error } = useCollection<CommunityStory>(communityStoriesQuery);

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl text-gray-800">
          Cuentos de la Comunidad
        </h1>
        <p className="max-w-3xl mx-auto text-primary mt-4 font-body">
          Descubre las historias creadas por otros soñadores como tú. Inspírate, comparte y deja que la magia de sus cuentos te transporte a nuevos mundos.
        </p>
      </div>

      {isLoading && (
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-auto w-full aspect-[2/3] rounded-lg" />
                    <Skeleton className="h-6 w-full mt-2" />
                     <Skeleton className="h-10 w-full mt-4" />
                </div>
            ))}
        </div>
      )}

      {error && (
         <Alert variant="destructive">
            <AlertTitle>Error al cargar los cuentos</AlertTitle>
            <AlertDescription>
                Hubo un problema al conectar con la base de datos. Por favor, inténtalo de nuevo más tarde.
            </AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && stories && stories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {stories.map((story) => (
            <Card key={story.id} className="overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl flex flex-col">
              <CardContent className="p-0">
                <Link href={`/comunidad/leer/${story.id}`}>
                  <Image
                    src={story.coverImageUrl}
                    alt={story.title}
                    width={400}
                    height={600}
                    className="w-full h-auto object-cover aspect-[2/3]"
                  />
                </Link>
              </CardContent>
              <CardHeader>
                <CardTitle className="text-lg text-center">{story.title}</CardTitle>
              </CardHeader>
              <CardFooter className="mt-auto p-4">
                <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href={`/comunidad/leer/${story.id}`}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Leer Cuento
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
       {!isLoading && !error && (!stories || stories.length === 0) && (
         <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-bold tracking-tight text-gray-800">
                Aún no hay cuentos en la comunidad
            </h2>
            <p className="mt-1 text-md text-muted-foreground">
                ¡Sé el primero en compartir tu creación!
            </p>
        </div>
      )}
    </div>
  );
}
