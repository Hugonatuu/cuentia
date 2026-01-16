
'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Check, Loader2 } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { useRouter } from '@/i18n/navigation';
import { useToast } from '@/hooks/use-toast';
import { createCheckoutSession } from '@/lib/stripe';

type PriceInfo = {
  price: string;
  stripePriceId: string;
};

type CreditPackCardProps = {
  priceInfo: PriceInfo;
};

export default function CreditPackCard({ priceInfo }: CreditPackCardProps) {
  const t = useTranslations('PreciosPage');
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    if (!user) {
      router.push('/registro');
      return;
    }
    if (!firestore) {
      toast({ variant: 'destructive', title: t('errorTitle'), description: t('errorDescription') });
      return;
    }

    setIsLoading(true);
    try {
      await createCheckoutSession(firestore, user.uid, priceInfo.stripePriceId, 'payment', 1, locale);
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        variant: 'destructive',
        title: t('paymentErrorTitle'),
        description: error instanceof Error ? error.message : t('paymentErrorDescription'),
      });
      setIsLoading(false);
    }
  };

  return (
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
            <Button onClick={handlePurchase} disabled={isLoading} size="sm">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              {t('creditPackButton')}
            </Button>
          </div>
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="text-center p-4 border-2 border-primary rounded-lg bg-primary/10">
              <p className="text-xl font-bold text-primary">{t('creditPackAmount')}</p>
              <p className="text-sm text-muted-foreground font-semibold">{priceInfo.price}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
