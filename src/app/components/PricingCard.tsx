'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type PricingPlan = {
  name: string;
  price: string;
  credits: string;
  features: string[];
  isFeatured: boolean;
  stripePriceId: string;
};

type PricingCardProps = {
  plan: PricingPlan;
  onCtaClick: () => void;
  isLoading: boolean;
};

export default function PricingCard({ plan, onCtaClick, isLoading }: PricingCardProps) {
  
  const ctaText = plan.isFeatured ? 'Plan Actual' : 'Cambiar Plan';

  return (
    <Card className={cn("flex flex-col", plan.isFeatured ? "border-primary ring-2 ring-primary shadow-lg" : "")}>
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>{plan.credits}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="mb-4">
          <span className="text-4xl font-bold">{plan.price}</span>
          {plan.name !== 'Pay as you go' && <span className="text-muted-foreground">/mes</span>}
        </div>
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className={cn("w-full", plan.isFeatured ? "" : "bg-accent text-accent-foreground hover:bg-accent/90")}
          onClick={onCtaClick}
          disabled={isLoading || plan.isFeatured}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ctaText}
        </Button>
      </CardFooter>
    </Card>
  );
}
