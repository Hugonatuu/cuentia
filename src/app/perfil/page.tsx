
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { userProfile, pricingPlans } from '@/lib/placeholder-data';
import PricingCard from '../components/PricingCard';
import { Skeleton } from '@/components/ui/skeleton';
import { userStoriesCollectionRef } from '@/firebase/firestore/references';
import { BookOpen, Hourglass, CreditCard, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Story {
  id: string;
  title: string;
  coverImageUrl: string;
  pdfUrl?: string;
  status: 'generating' | 'completed';
}

export default function PerfilPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [payAsYouGoEuros, setPayAsYouGoEuros] = useState(5);


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

  if (isUserLoading || !user) {
    return (
      <div className="container mx-auto py-12">
        <div className="grid gap-10 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
          <div className="flex flex-col items-center text-center">
            <Skeleton className="h-24 w-24 rounded-full mb-4" />
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="grid gap-10">
            <Card>
              <CardHeader>
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-5 w-64 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-36" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-[60%]" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Tabs defaultValue="stories">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="stories">Mis Cuentos</TabsTrigger>
                <TabsTrigger value="subscription">Suscripción</TabsTrigger>
              </TabsList>
              <TabsContent value="stories">
                 <Skeleton className="h-96 w-full" />
              </TabsContent>
               <TabsContent value="subscription">
                 <Skeleton className="h-96 w-full" />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }

  const subscriptionCreditPercentage = (userProfile.subscriptionCredits.current / userProfile.subscriptionCredits.total) * 100;
  const paygCreditPercentage = (userProfile.payAsYouGoCredits.current / userProfile.payAsYouGoCredits.total) * 100;
  const payAsYouGoCredits = payAsYouGoEuros * 1000;


  return (
    <div className="container mx-auto py-12">
      <div className="grid gap-10 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage
              src={user.photoURL || userProfile.avatar.imageUrl}
              alt={user.displayName || userProfile.name}
              data-ai-hint={userProfile.avatar.imageHint}
            />
            <AvatarFallback>
              {user.displayName
                ? user.displayName.charAt(0)
                : user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold">{user.displayName || userProfile.name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="grid gap-10">
          <Card>
            <CardHeader>
              <CardTitle>Tu Plan Actual: {userProfile.subscription}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="subscription">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="subscription">Mi suscripción</TabsTrigger>
                  <TabsTrigger value="payg">Créditos Pay As You Go</TabsTrigger>
                </TabsList>
                <TabsContent value="subscription" className="mt-4">
                  <div className="space-y-2">
                    <p className="font-semibold">Créditos restantes del plan</p>
                    <div className="flex items-center gap-4">
                      <Progress value={subscriptionCreditPercentage} className="w-[60%]" />
                      <span className="font-bold">
                        {userProfile.subscriptionCredits.current.toLocaleString()} /{' '}
                        {userProfile.subscriptionCredits.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="payg" className="mt-4">
                  <div className="space-y-2">
                    <p className="font-semibold">Créditos comprados</p>
                    <div className="flex items-center gap-4">
                      <Progress value={paygCreditPercentage} className="w-[60%]" />
                      <span className="font-bold">
                        {userProfile.payAsYouGoCredits.current.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <Tabs defaultValue="stories">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stories">Mis Cuentos</TabsTrigger>
              <TabsTrigger value="subscription">Suscripción</TabsTrigger>
            </TabsList>
            <TabsContent value="stories">
              <Card>
                <CardHeader>
                  <CardTitle>Mis Cuentos Creados</CardTitle>
                  <CardDescription>
                    Aquí encontrarás todas tus creaciones mágicas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {areStoriesLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(3)].map((_, i) => (
                         <div key={i} className="space-y-2">
                            <Skeleton className="h-auto w-full aspect-[2/3] rounded-lg" />
                            <Skeleton className="h-6 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : stories && stories.length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stories.map((story) => {
                            const isCompleted = story.status === 'completed' && story.pdfUrl;
                            return (
                                <Card
                                key={story.id}
                                className="overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl flex flex-col"
                                >
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
                                                <Hourglass className="h-10 w-10 mb-2 animate-spin" />
                                                <h3 className="text-md font-semibold text-center">Generando...</h3>
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardHeader>
                                        <CardTitle className="text-lg text-center truncate">{story.title}</CardTitle>
                                    </CardHeader>
                                    <CardFooter className="mt-auto">
                                        <Button asChild className="w-full" disabled={!isCompleted}>
                                          <Link href={isCompleted ? `/cuentos/leer/${story.id}` : '#'}>
                                            {isCompleted ? <BookOpen className="mr-2 h-4 w-4" /> : <Hourglass className="mr-2 h-4 w-4" />}
                                            {isCompleted ? 'Leer Cuento' : 'Generando...'}
                                          </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-10 px-6 border-2 border-dashed rounded-lg">
                        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h2 className="mt-4 text-xl font-bold tracking-tight text-gray-800">
                          Aún no has creado ningún cuento
                        </h2>
                        <p className="mt-1 text-md text-muted-foreground">
                          ¡Es hora de dar vida a tu primera historia!
                        </p>
                        <Button asChild className="mt-4">
                        <Link href="/cuentos/crear">
                            Crear mi primer cuento
                        </Link>
                        </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="subscription">
              <div className="space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Modelo Pay As You Go</CardTitle>
                        <CardDescription>Paga únicamente por lo que vas a usar</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-2">
                        <div className='flex items-center gap-6'>
                            <div className="flex-grow space-y-2">
                                <div className='flex justify-between font-medium'>
                                    <span>{payAsYouGoEuros}€</span>
                                    <span>{payAsYouGoCredits.toLocaleString()} créditos</span>
                                </div>
                                <Slider 
                                    value={[payAsYouGoEuros]} 
                                    onValueChange={(value) => setPayAsYouGoEuros(value[0])}
                                    min={5} 
                                    max={50} 
                                    step={1} 
                                />
                            </div>
                            <Button>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Comprar Créditos
                            </Button>
                        </div>
                         <Alert variant="destructive" className="mt-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Aviso</AlertTitle>
                            <AlertDescription>
                                Con este modelo los créditos cuestan un 20% más que en las suscripciones.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-2 border-primary/20 shadow-lg shadow-primary/10">
                   <div className="absolute top-2 right-2 bg-green-500 text-white text-base font-bold px-3 py-1.5 rounded-full rotate-12 transform">
                     <span>-20%</span>
                   </div>
                  <CardHeader>
                    <CardTitle>✨ Suscríbete y ahorra un 20 % en créditos</CardTitle>
                    <CardDescription>Disfruta de nuevas actualizaciones antes que nadie, funciones premium y un 20 % más de créditos por el mismo precio.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {pricingPlans
                      .filter((p) => p.name !== 'Pay as you go')
                      .map((plan) => (
                        <div key={plan.name} className="flex flex-col">
                          <PricingCard
                            plan={{
                              ...plan,
                              isFeatured: plan.name === userProfile.subscription,
                              cta:
                                plan.name === userProfile.subscription
                                  ? 'Plan Actual'
                                  : 'Cambiar Plan',
                            }}
                          />
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
