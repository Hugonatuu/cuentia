
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { userStoriesCollectionRef } from '@/firebase/firestore/references';
import { BookOpen, Download, Hourglass } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Definiendo un tipo para la estructura de un cuento
interface Story {
  id: string;
  title: string;
  coverImageUrl: string;
  pdfUrl: string;
  status: 'generating' | 'completed';
}

const StoryCard = ({ story }: { story: Story }) => {
  const isCompleted = story.status === 'completed' && story.pdfUrl;

  return (
    <Card className="overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl flex flex-col">
      <Link href={isCompleted ? story.pdfUrl : '#'} target="_blank" rel="noopener noreferrer" className={`block flex-grow ${!isCompleted ? 'pointer-events-none' : ''}`}>
        <CardContent className="p-0 relative">
          <Image
            src={story.coverImageUrl || '/placeholder-cover.png'}
            alt={story.title}
            width={400}
            height={600}
            className="w-full h-auto object-cover aspect-[2/3]"
          />
          {!isCompleted && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-4">
              <Hourglass className="h-12 w-12 mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-center">Generando tu cuento...</h3>
            </div>
          )}
        </CardContent>
        <CardHeader>
          <CardTitle className="text-lg truncate">{story.title}</CardTitle>
        </CardHeader>
      </Link>
      <CardFooter className="mt-auto">
        <Button asChild className="w-full" disabled={!isCompleted}>
          <a href={isCompleted ? story.pdfUrl : undefined} download>
            {isCompleted ? <Download className="mr-2 h-4 w-4" /> : <Hourglass className="mr-2 h-4 w-4" />}
            {isCompleted ? 'Descargar' : 'Generando...'}
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};


export default function MisCuentosPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);
  
  const userStoriesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return userStoriesCollectionRef(firestore, user.uid);
  }, [firestore, user]);

  const { data: stories, isLoading: areStoriesLoading } = useCollection<Story>(userStoriesQuery);


  if (isUserLoading || areStoriesLoading) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center mb-12">
          <Skeleton className="h-14 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-auto w-full aspect-[2/3] rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl text-gray-800">
          Mis Cuentos Mágicos
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground mt-4">
          Aquí están todas las aventuras que has creado. ¡Sigue soñando!
        </p>
      </div>

      {stories && stories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
         <div className="text-center py-20 px-6 border-2 border-dashed rounded-lg">
            <BookOpen className="mx-auto h-16 w-16 text-muted-foreground" />
            <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-800">
              Aún no has creado ningún cuento
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              ¡Es hora de dar vida a tu primera historia! ¿Qué aventura te espera?
            </p>
            <Button asChild className="mt-6">
              <Link href="/cuentos/crear">
                Crear mi primer cuento
              </Link>
            </Button>
          </div>
      )}
    </div>
  );
}

    
