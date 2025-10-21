'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { userProfile } from '@/lib/placeholder-data'; // Usando datos de placeholder

export default function MisCuentosPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center mb-12">
          <Skeleton className="h-14 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-auto w-full aspect-[2/3]" />
              <Skeleton className="h-6 w-3/4" />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {userProfile.stories.map((story) => (
          <Card
            key={story.id}
            className="overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl"
          >
            <Link href="#">
              <CardContent className="p-0">
                <Image
                  src={story.image.imageUrl}
                  alt={story.title}
                  width={400}
                  height={600}
                  className="w-full h-auto object-cover aspect-[2/3]"
                  data-ai-hint={story.image.imageHint}
                />
              </CardContent>
              <CardHeader>
                <CardTitle className="text-lg">{story.title}</CardTitle>
              </CardHeader>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
