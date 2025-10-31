'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { userStoriesCollectionRef, userDocRef } from '@/firebase/firestore/references';
import { BookOpen, Hourglass, CreditCard, Calendar, Gift, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import EditDisplayName from './components/EditDisplayName';
import EditAvatar from './components/EditAvatar';
import { CreditsInfoDialog } from './components/CreditsInfoDialog';
import { getPlanLimits } from '@/lib/plans';
import { useCollection } from '@/firebase/firestore/use-collection'; 
import { watchUserSubscription } from '@/lib/firestore'; 
import { updateDoc } from 'firebase/firestore';

interface Story {
  id: string;
  title: string;
  coverImageUrl: string;
  pdfUrl?: string;
  status: 'generating' | 'completed';
}

interface UserProfile {
    stripeRole?: string;
    monthlyCreditCount?: number;
    current_period_start?: { seconds: number; nanoseconds: number };
    subscriptionId?: string;
}

const STRIPE_BILLING_PORTAL_URL = 'https://billing.stripe.com/p/login/test_9B66oGbbidu391N0BbeME00';

export default function PerfilPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [isCreditsInfoOpen, setIsCreditsInfoOpen] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoading && (!user || !user.emailVerified)) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const userRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return userDocRef(firestore, user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userRef);

  // Observe subscription changes and update the user's role
  useEffect(() => {
    if (firestore && user?.uid) {
      const unsubscribe = watchUserSubscription(firestore, user.uid, (newRole) => {
        setCurrentUserRole(newRole);
      });
      return () => unsubscribe(); // Cleanup listener on unmount
    }
  }, [firestore, user?.uid]);


  const userStoriesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return userStoriesCollectionRef(firestore, user.uid);
  }, [firestore, user]);

  const { data: stories, isLoading: areStoriesLoading } = useCollection<Story>(userStoriesQuery);

  if (isUserLoading || isProfileLoading || !user || !user.emailVerified) {
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
          </div>
        </div>
        <div className="mt-10">
           <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const role = userProfile?.stripeRole || currentUserRole;
  const planLimits = role ? getPlanLimits(role) : 0;
  const creditsUsed = userProfile?.monthlyCreditCount || 0;
  const subscriptionCreditPercentage = planLimits > 0 ? (creditsUsed / planLimits) * 100 : 0;
  const billingDate = userProfile?.current_period_start ? new Date(userProfile.current_period_start.seconds * 1000) : new Date();

  return (
    <div className="container mx-auto py-12">
      <CreditsInfoDialog isOpen={isCreditsInfoOpen} onOpenChange={setIsCreditsInfoOpen} />
      <div className="grid gap-10 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
        <div className="flex flex-col items-center text-center">
          <EditAvatar user={user} />
           <EditDisplayName user={user} />
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="grid gap-10">
          <Card>
            <CardHeader>
              <CardTitle>Tu Plan Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="subscription">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="subscription">Mi suscripción</TabsTrigger>
                  <TabsTrigger value="payg">Créditos Pay As You Go</TabsTrigger>
                </TabsList>
                <TabsContent value="subscription" className="mt-4">
                 {role ? (
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div className='space-y-1'>
                                <p className="text-lg font-bold text-primary capitalize">{role}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Próxima facturación: {format(billingDate, 'dd MMM yyyy', { locale: es })}</span>
                                </p>
                            </div>
                            <Button asChild variant="outline">
                              <a href={STRIPE_BILLING_PORTAL_URL} target="_blank" rel="noopener noreferrer">Gestionar mi suscripción</a>
                            </Button>
                        </div>
                        <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between">
                                <p className="font-semibold text-sm">Créditos restantes del plan</p>
                                <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => setIsCreditsInfoOpen(true)}>
                                    <Info className="mr-1 h-4 w-4" />
                                    ¿Cómo funcionan?
                                </Button>
                            </div>
                            <div className="flex items-center gap-4">
                                <Progress value={subscriptionCreditPercentage} className="flex-grow" />
                                <span className="font-bold text-sm">
                                    {(planLimits - creditsUsed).toLocaleString()} /{' '}
                                    {planLimits.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                 ) : (
                    <div className="text-center py-6">
                        <p className="text-muted-foreground mb-4">No tienes una suscripción activa.</p>
                        <Button asChild>
                            <Link href="/precios">Ver Planes</Link>
                        </Button>
                    </div>
                 )}
                </TabsContent>
                <TabsContent value="payg" className="mt-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <p className="font-semibold">Créditos comprados</p>
                      <div className="flex items-center gap-4">
                        <Gift className="h-6 w-6 text-primary" />
                        <span className="font-bold text-xl">
                          0
                        </span>
                      </div>
                    </div>
                     <Button asChild>
                        <Link href="/precios">
                            <CreditCard className="mr-2 h-4 w-4" />
                            Añadir Créditos
                        </Link>
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="mt-10">
        <Card>
            <CardHeader>
                <CardTitle>Mis Cuentos Creados</CardTitle>
                <CardDescription>
                Aquí encontrarás todas tus creaciones mágicas.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {areStoriesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-2">
                        <Skeleton className="h-auto w-full aspect-[2/3] rounded-lg" />
                        <Skeleton className="h-6 w-full" />
                        </div>
                    ))}
                </div>
                ) : stories && stories.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                                        alt={story.title || 'Portada del cuento'}
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
      </div>
    </div>
  );
}
