
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useLocale, useMessages, useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { createCheckoutSession } from '@/lib/stripe';
import { useRouter } from '@/i18n/navigation';
import { useToast } from '@/hooks/use-toast';
import { query, where, collection, Timestamp, Firestore } from 'firebase/firestore';

// --- Type Definitions ---
interface Subscription {
  id: string;
  status: 'active' | 'trialing' | 'past_due' | 'incomplete';
  price: { id: string; };
  items: { price: { id: string; } }[];
}

type PlanPriceInfo = {
  price: string;
  stripePriceId: string;
};

type PlanData = {
  id: string;
  prices: {
    eur: PlanPriceInfo;
    usd: PlanPriceInfo;
  };
};

type PricingPlanCardProps = {
  plan: PlanData;
  currency: 'eur' | 'usd';
  isMostPopular?: boolean;
};

const STRIPE_BILLING_PORTAL_URL = 'https://billing.stripe.com/p/login/test_9B66oGbbidu391N0BbeME00';


export default function PricingPlanCard({ plan, currency, isMostPopular = false }: PricingPlanCardProps) {
  const t = useTranslations('PreciosPage.pricingPlans');
  const messages = useMessages();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const locale = useLocale();

  const [isLoading, setIsLoading] = useState(false);

  // Memoize the query to prevent re-renders
  const subscriptionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    const subsRef = collection(firestore as Firestore, `customers/${user.uid}/subscriptions`);
    return query(subsRef, where('status', 'in', ['trialing', 'active', 'past_due', 'incomplete']));
  }, [firestore, user]);

  const { data: subscriptions, isLoading: isLoadingSubscriptions } = useCollection<Subscription>(subscriptionsQuery);

  const primarySubscription = useMemo(() => {
    if (!subscriptions) return null;
    return subscriptions.find(s => ['active', 'trialing'].includes(s.status)) ||
           subscriptions.find(s => ['past_due', 'incomplete'].includes(s.status)) ||
           null;
  }, [subscriptions]);

  const isCurrentUserPlan = primarySubscription?.items?.[0]?.price.id === plan.prices[currency].stripePriceId;
  const hasActiveSubscription = !!primarySubscription;
  
  const planFeatures = Object.keys((messages.PreciosPage as any).pricingPlans[plan.id]['features']);
  const priceInfo = plan.prices[currency];

  let ctaText = t(`${plan.id}.cta`);
  if (hasActiveSubscription) {
    ctaText = isCurrentUserPlan ? 'Plan Actual' : 'Gestionar Plan';
  }

  const handleCtaClick = async () => {
    if (!user) {
      router.push('/registro');
      return;
    }

    if (hasActiveSubscription) {
      window.location.assign(STRIPE_BILLING_PORTAL_URL);
      return;
    }

    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo conectar a la base de datos.' });
      return;
    }

    setIsLoading(true);
    try {
      await createCheckoutSession(firestore, user.uid, priceInfo.stripePriceId, 'subscription', 1, locale);
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        variant: 'destructive',
        title: 'Error al procesar el pago',
        description: error instanceof Error ? error.message : 'Hubo un problema al crear la sesión de pago.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonLoading = isLoading || isLoadingSubscriptions;

  return (
    <Card className={cn("flex flex-col h-full", isCurrentUserPlan && "border-primary ring-2 ring-primary shadow-lg", isMostPopular && "border-blue-500 ring-2 ring-blue-500 shadow-lg")}>
      <CardHeader>
        <CardTitle>{t(`${plan.id}.name`)}</CardTitle>
        <CardDescription>{t(`${plan.id}.credits`)}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="mb-4">
          <span className="text-4xl font-bold">{priceInfo.price}</span>
          <span className="text-muted-foreground">/{t('month')}</span>
        </div>
        <ul className="space-y-2">
          {planFeatures.map((feature, index) => {
            const isUnsupportedFeature = (plan.id === 'artista' || plan.id === 'magic') && (feature === 'prioritySupport' || feature === 'earlyAccess');
            return (
              <li key={index} className="flex items-start gap-2">
                {!isUnsupportedFeature ? (
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                ) : (
                  <div className="h-4 w-4 flex-shrink-0 mt-1" />
                )}
                <span className="text-sm text-muted-foreground">{t(`${plan.id}.features.${feature}`)}</span>
              </li>
            );
          })}
        </ul>
        <p className="text-sm font-semibold text-foreground mt-4">{t(`${plan.id}.storyCount`)}</p>
      </CardContent>
      <CardFooter>
        <Button 
          className={cn("w-full", !isCurrentUserPlan && "bg-accent text-accent-foreground hover:bg-accent/90")}
          onClick={handleCtaClick}
          disabled={isButtonLoading || isCurrentUserPlan}
        >
          {isButtonLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ctaText}
        </Button>
      </CardFooter>
    </Card>
  );
}
