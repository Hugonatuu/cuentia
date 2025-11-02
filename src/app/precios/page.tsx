'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CreditsInfoDialog } from '@/app/perfil/components/CreditsInfoDialog';
import { pricingPlans } from '@/lib/placeholder-data';
import PricingCard from '../components/PricingCard';
import {
  Info,
  CreditCard,
  Star,
  Loader2,
  Gem,
  AlertTriangle,
} from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { createCheckoutSession } from '@/lib/stripe';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where } from 'firebase/firestore';
import { customerSubscriptionsCollectionRef } from '@/firebase/firestore/references';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Subscription {
  id: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  price: {
    id: string;
    product: {
      id: string;
    },
    metadata: {
        firebaseRole?: string;
    }
  };
  items: {
    price: {
        id: string;
        product: {
            id: string;
        },
        metadata: {
            firebaseRole?: string;
        }
    }
  }[];
}

const creditPack = {
  euros: '5€',
  credits: '5.000',
  priceId: 'price_1SOhZfArzx82mGRMGnt8jg5G',
};


const STRIPE_BILLING_PORTAL_URL = 'https://billing.stripe.com/p/login/test_9B66oGbbidu391N0BbeME00';

export default function PreciosPage() {
  const [isCreditsInfoOpen, setIsCreditsInfoOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const subscriptionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    const subsRef = customerSubscriptionsCollectionRef(firestore, user.uid);
    return query(subsRef, where('status', 'in', ['trialing', 'active']));
  }, [firestore, user]);

  const { data: subscriptions, isLoading: isLoadingSubscriptions } = useCollection<Subscription>(subscriptionsQuery);
  const activeSubscription = subscriptions?.[0];

  const handlePurchase = async (priceId: string, mode: 'subscription' | 'payment') => {
    if (!user) {
      router.push('/registro');
      return;
    }

    if (mode === 'subscription' && activeSubscription) {
        window.location.assign(STRIPE_BILLING_PORTAL_URL);
        return;
    }

    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo conectar a la base de datos.',
      });
      return;
    }

    setIsLoading(priceId);

    try {
      await createCheckoutSession(firestore, user.uid, priceId, mode);
      // The function will handle the redirection.
    } catch (error) {
      console.error('Error handling subscription:', error);
      toast({
        variant: 'destructive',
        title: 'Error al procesar el pago',
        description: error instanceof Error ? error.message : 'Hubo un problema al crear la sesión de pago. Por favor, inténtalo de nuevo.',
      });
       setIsLoading(null);
    }
  };


  return (
    <div className="container mx-auto py-12">
      <CreditsInfoDialog
        isOpen={isCreditsInfoOpen}
        onOpenChange={setIsCreditsInfoOpen}
      />
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl text-gray-800">
          Planes para Cada Creador
        </h1>
        <p className="max-w-3xl mx-auto text-primary mt-4 font-body">
          Elige la opción que mejor se adapte a tu ritmo creativo. Más
          créditos, más historias, más magia.
        </p>
      </div>

      <div className="space-y-12 max-w-7xl mx-auto">
        <div className="flex justify-start mb-4">
          <Button variant="outline" onClick={() => setIsCreditsInfoOpen(true)}>
            <Info className="mr-2 h-4 w-4" />
            ¿Cómo funcionan los créditos?
          </Button>
        </div>

        <div>
          <Card>
            <CardHeader className="relative">
              <CardTitle>Paquetes de Créditos (Pay As You Go)</CardTitle>
              <CardDescription className="font-bold text-primary pt-2">
                Compra créditos que no caducan. Ideal para empezar o para proyectos puntuales.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 p-6 bg-background rounded-lg">
                <div className="text-center">
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{creditPack.euros}</span>
                  </div>
                  <p className="flex items-center justify-center gap-2 text-lg font-semibold text-primary">
                    <Gem className="h-5 w-5" />
                    <span>{creditPack.credits} créditos</span>
                  </p>
                </div>
                <Button 
                  className="w-full md:w-auto"
                  size="lg"
                  onClick={() => handlePurchase(creditPack.priceId, 'payment')}
                  disabled={isLoading === creditPack.priceId}
                >
                  {isLoading === creditPack.priceId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                  Comprar
                </Button>
              </div>
            </CardContent>
            <div className="flex justify-center pb-6">
                 <Alert variant="destructive" className="w-auto">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                      Aviso: Con el modelo de suscripción obtienes hasta un 45 % más de créditos al mes.
                  </AlertDescription>
              </Alert>
            </div>
          </Card>
        </div>

        <div className="relative pt-8">
          <div className="absolute -top-0 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
              <Star className="h-5 w-5" />
              <span className="text-sm font-bold tracking-wider">
                RECOMENDADO
              </span>
            </div>
          </div>
          <Card className="overflow-hidden border-2 border-primary shadow-lg shadow-primary/25">
            <CardHeader>
              <CardTitle>✨ Suscríbete y ahorra en cada crédito</CardTitle>
              <CardDescription className="font-bold text-primary">
                Disfruta de nuevas actualizaciones antes que nadie, funciones
                premium y un precio por crédito mucho más reducido.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pricingPlans
                .filter((p) => p.name !== 'Pay as you go')
                .map((plan) => (
                  <div key={plan.name} className="flex flex-col">
                     <PricingCard
                      plan={plan}
                      onCtaClick={() => handlePurchase(plan.stripePriceId, 'subscription')}
                      isLoading={isLoading === plan.stripePriceId || isLoadingSubscriptions}
                      isCurrentUserPlan={activeSubscription?.items?.[0]?.price.id === plan.stripePriceId}
                      hasActiveSubscription={!!activeSubscription}
                    />
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
