import { headers } from 'next/headers';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Gem, Info, Star } from 'lucide-react';

import { pricingPlans as basePricingPlans, EU_COUNTRIES } from '@/lib/placeholder-data';
import CreditPackCard from './components/CreditPackCard';
import PricingPlanCard from './components/PricingPlanCard';
import CreditsInfoButton from './components/CreditsInfoButton';

const creditPackPriceIds = {
  eur: { price: '5€', stripePriceId: 'price_1SOhZfArzx82mGRMGnt8jg5G' },
  usd: { price: '$5', stripePriceId: 'price_1SOhZfArzx82mGRMGnt8jg5G' }
};

type PageProps = {
  searchParams?: {
    forceCountry?: string;
  };
};

export default function PreciosPage({ searchParams }: PageProps) {
  const t = useTranslations('PreciosPage');
  
  // SERVER-SIDE LOGIC
  const headersList = headers();
  const forcedCountry = searchParams?.forceCountry?.toUpperCase();
  const countryCode = forcedCountry || headersList.get('x-vercel-ip-country')?.toUpperCase();
  
  const currency: 'eur' | 'usd' = (countryCode && EU_COUNTRIES.includes(countryCode)) ? 'eur' : 'usd';

  return (
    <div className="container mx-auto py-12">
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
          <CreditsInfoButton />
        </div>

        <CreditPackCard priceInfo={creditPackPriceIds[currency]} />

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
                            <div className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-8 py-1 rounded-full flex items-center gap-2 shadow-lg">
                                <Gem className="h-5 w-5" />
                                <span className="text-xs font-bold tracking-wider whitespace-nowrap">
                                {t('mostPopularBadge')}
                                </span>
                            </div>
                           </div>
                        )}
                        <PricingPlanCard
                          plan={plan}
                          currency={currency}
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
