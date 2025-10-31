'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/[locale]/components/ui/card";
import { Button } from "@/app/[locale]/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/app/[locale]/firebase";
import { useRouter } from "next/navigation";

type PricingPlan = {
  name: string;
  price: string;
  credits: string;
  features: string[];
  isFeatured: boolean;
  cta: string;
};

type PricingCardProps = {
  plan: PricingPlan;
};

export default function PricingCard({ plan }: PricingCardProps) {
  const { user } = useUser();
  const router = useRouter();

  const handleCtaClick = () => {
    if (!user) {
      router.push('/registro');
    } else {
      // TODO: Implement subscription logic for logged-in users
      console.log(`Redirecting to subscription page for ${plan.name}`);
    }
  };

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
          onClick={handleCtaClick}
        >
          {plan.cta}
        </Button>
      </CardFooter>
    </Card>
  );
}
