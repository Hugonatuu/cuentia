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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { CreditsInfoDialog } from '@/app/perfil/components/CreditsInfoDialog';
import { pricingPlans, userProfile } from '@/lib/placeholder-data';
import PricingCard from '../components/PricingCard';
import {
  Info,
  CreditCard,
  AlertTriangle,
  Star,
} from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { createCheckoutSession } from '@/lib/stripe';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function PreciosPage() {
  const [payAsYouGoEuros, setPayAsYouGoEuros] = useState(5);
  const [isCreditsInfoOpen, setIsCreditsInfoOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const payAsYouGoCredits = payAsYouGoEuros * 1000;

  const handleSubscription = async (priceId: string) => {
    if (!user) {
      router.push('/registro');
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
      await createCheckoutSession(firestore, user.uid, priceId);
      // The page will redirect to Stripe Checkout.
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        variant: 'destructive',
        title: 'Error al suscribirse',
        description: 'Hubo un problema al crear la sesión de pago. Por favor, inténtalo de nuevo.',
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

      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex justify-start mb-4">
          <Button variant="outline" onClick={() => setIsCreditsInfoOpen(true)}>
            <Info className="mr-2 h-4 w-4" />
            ¿Cómo funcionan los créditos?
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Modelo Pay As You Go</CardTitle>
            <CardDescription>
              Paga únicamente por lo que vas a usar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            <div className="flex items-center gap-6">
              <div className="flex-grow space-y-2">
                <div className="flex justify-between font-medium">
                  <span>{payAsYouGoEuros}€</span>
                  <span>{payAsYouGoCredits} créditos</span>
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
                Con este modelo los créditos cuestan un 20% más que en las
                suscripciones.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

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
              <CardTitle>✨ Suscríbete y ahorra un 20 % en créditos</CardTitle>
              <CardDescription>
                Disfruta de nuevas actualizaciones antes que nadie, funciones
                premium y un 20 % más de créditos por el mismo precio.
              </CardDescription>
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
                      }}
                      onCtaClick={() => handleSubscription(plan.stripePriceId)}
                      isLoading={isLoading === plan.stripePriceId}
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
