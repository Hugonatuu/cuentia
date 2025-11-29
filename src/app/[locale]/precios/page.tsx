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
import { CreditsInfoDialog } from '@/app/[locale]/perfil/components/CreditsInfoDialog';
import { pricingPlans as basePricingPlans } from '@/lib/placeholder-data';
import PricingCard from '@/app/components/PricingCard';
import {
  Info,
  CreditCard,
  Star,
  Loader2,
  Gem,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { createCheckoutSession } from '@/lib/stripe';
import { useRouter} from '@/i18n/navigation';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where } from 'firebase/firestore';
import { customerSubscriptionsCollectionRef } from '@/firebase/firestore/references';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLocale, useTranslations } from 'next-intl';

interface Subscription {
  id: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';
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
  credits: '4.500',
  priceId: 'price_1SOhZfArzx82mGRMGnt8jg5G',
};


const STRIPE_BILLING_PORTAL_URL = 'https://billing.stripe.com/p/login/test_9B66oGbbidu391N0BbeME00';

export default function PreciosPage() {
  const t = useTranslations('PreciosPage');
  const [isCreditsInfoOpen, setIsCreditsInfoOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const locale = useLocale();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const subscriptionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    const subsRef = customerSubscriptionsCollectionRef(firestore, user.uid);
    return query(subsRef, where('status', 'in', ['trialing', 'active', 'past_due', 'incomplete']));
  }, [firestore, user]);

  const { data: subscriptions, isLoading: isLoadingSubscriptions } = useCollection<Subscription>(subscriptionsQuery);
  
  const activeSubscription = subscriptions?.find(s => ['active', 'trialing'].includes(s.status));
  const pastDueSubscription = subscriptions?.find(s => ['past_due', 'incomplete'].includes(s.status));
  const primarySubscription = activeSubscription || pastDueSubscription;


  const handlePurchase = async (priceId: string, mode: 'subscription' | 'payment') => {
    if (!user) {
      router.push('/registro');
      return;
    }

    if (mode === 'subscription' && primarySubscription) {
        window.location.assign(STRIPE_BILLING_PORTAL_URL);
        return;
    }

    if (!firestore) {
      toast({
        variant: 'destructive',
        title: t('errorTitle'),
        description: t('errorDescription'),
      });
      return;
    }

    setIsLoading(priceId);

    try {
      await createCheckoutSession(firestore, user.uid, priceId, mode, 1, locale);
    } catch (error) {
      console.error('Error handling subscription:', error);
      toast({
        variant: 'destructive',
        title: t('paymentErrorTitle'),
        description: error instanceof Error ? error.message : t('paymentErrorDescription'),
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
          {t('pageTitle')}
        </h1>
        <p className="max-w-3xl mx-auto text-primary mt-4 font-body">
          {t('pageDescription')}
        </p>
      </div>

      <div className="space-y-12 max-w-7xl mx-auto">
        <div className="flex justify-start mb-4">
          <Button variant="outline" onClick={() => setIsCreditsInfoOpen(true)}>
            <Info className="mr-2 h-4 w-4" />
            {t('creditsInfoButton')}
          </Button>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-12">
              <div className="flex-grow space-y-4">
                <div>
                    <CardTitle className="text-xl">{t('creditPackTitle')}</CardTitle>
                    <CardDescription className="font-bold text-foreground mt-1">
                    {t('creditPackDescription')}
                    </CardDescription>
                    <p className="text-primary mt-1">{t('creditPackSubDescription')}</p>
                </div>
                <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                        <span className="text-sm text-muted-foreground">{t('creditPackFeature')}</span>
                    </li>
                </ul>
                 <Button
                  onClick={() => handlePurchase(creditPack.priceId, 'payment')}
                  disabled={isLoading === creditPack.priceId}
                  size="sm"
                >
                  {isLoading === creditPack.priceId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                  {t('creditPackButton')}
                </Button>
              </div>
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="text-center p-4 border-2 border-primary rounded-lg bg-primary/10">
                  <p className="text-xl font-bold text-primary">{t('creditPackAmount')}</p>
                  <p className="text-sm text-muted-foreground font-semibold">{t('creditPackPrice')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
             <Alert className="w-auto inline-flex items-center gap-3 bg-gradient-to-r from-blue-400 to-purple-500 text-white border-0">
                <Gem className="h-5 w-5" />
                <AlertTitle className="font-semibold">
                    {t('subscriptionAlert')}
                </AlertTitle>
            </Alert>
        </div>

        <div className="relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
              <Star className="h-5 w-5" />
              <span className="text-sm font-bold tracking-wider">
                {t('recommendedBadge')}
              </span>
            </div>
          </div>
          <Card className="overflow-hidden border-2 border-primary shadow-lg shadow-primary/25 pt-6">
            <CardHeader className="pt-0">
              <CardTitle className="text-2xl font-bold">{t('subscriptionTitle')}</CardTitle>
              <CardDescription className="font-bold text-primary !mt-2">
                {t('subscriptionDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {basePricingPlans
                    .filter((p) => t(`pricingPlans.${p.id}.name`) !== 'Pay as you go')
                    .map((plan) => (
                      <div key={t(`pricingPlans.${plan.id}.name`)} className="flex flex-col relative">
                        {plan.id === 'special' && (
                           <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                            <div className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                                <Gem className="h-5 w-5" />
                                <span className="text-sm font-bold tracking-wider">
                                {t('mostPopularBadge')}
                                </span>
                            </div>
                           </div>
                        )}
                        <PricingCard
                          plan={plan}
                          onCtaClick={() => handlePurchase(plan.stripePriceId, 'subscription')}
                          isLoading={isLoading === plan.stripePriceId || isLoadingSubscriptions}
                          isCurrentUserPlan={primarySubscription?.items?.[0]?.price.id === plan.stripePriceId}
                          hasActiveSubscription={!!primarySubscription}
                          isMostPopular={plan.id === 'special'}
                        />
                      </div>
                    ))}
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
