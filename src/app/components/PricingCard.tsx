'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessages, useTranslations } from "next-intl";

type PricingPlan = {
  id:string;
  // name: string;
  price: string;
  // credits: string;
  // features: string[];
  stripePriceId: string;
};

type PricingCardProps = {
  plan: PricingPlan;
  onCtaClick: () => void;
  isLoading: boolean;
  isCurrentUserPlan: boolean;
  hasActiveSubscription: boolean;
};

export default function PricingCard({ plan, onCtaClick, isLoading, isCurrentUserPlan, hasActiveSubscription }: PricingCardProps) {
  const t = useTranslations('PreciosPage.pricingPlans')
  const plans = useMessages()
  const planFeatures = Object.keys(plans.PreciosPage.pricingPlans[plan.id]['features']);

  let ctaText = t(`${plan.id}.cta`);
  if (hasActiveSubscription) {
    ctaText = isCurrentUserPlan ? 'Plan Actual' : 'Gestionar Plan';
  }

  return (
    <Card className={cn("flex flex-col", isCurrentUserPlan ? "border-primary ring-2 ring-primary shadow-lg" : "")}>
      <CardHeader>
        <CardTitle>{t(`${plan?.id}.name`)}</CardTitle>
        <CardDescription>{t(`${plan?.id}.credits`)}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="mb-4">
          <span className="text-4xl font-bold">{plan.price}</span>
          {t(`${plan?.id}.name`) !== 'Pay as you go' && <span className="text-muted-foreground">/{t('month')}</span>}
        </div>
        <ul className="space-y-2">
          {planFeatures.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
              <span className="text-sm text-muted-foreground">{t(`${plan.id}.features.${feature}`)}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className={cn("w-full", !isCurrentUserPlan ? "bg-accent text-accent-foreground hover:bg-accent/90" : "")}
          onClick={onCtaClick}
          disabled={isLoading || isCurrentUserPlan}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ctaText}
        </Button>
      </CardFooter>
    </Card>
  );
}
