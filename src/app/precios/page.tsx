
'use client';
import { pricingPlans } from "@/lib/placeholder-data";
import PricingCard from "@/app/components/PricingCard";

export default function PreciosPage() {
  return (
    <section id="precios" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-headline text-4xl md:text-5xl text-gray-800">
            Planes para Cada Creador
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mt-4">
            Elige la opción que mejor se adapte a tu ritmo creativo. Más
            créditos, más historias, más magia.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}
