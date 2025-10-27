
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ArrowRight, Sparkles } from "lucide-react";
import placeholderImages from "@/lib/placeholder-images.json";
import {
  exampleStories,
  howItWorksSteps,
  pricingPlans,
} from "@/lib/placeholder-data";
import PricingCard from "./components/PricingCard";
import Image from "next/image";

export default function Home() {

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[60vh] md:h-[80vh] flex items-center justify-center text-white overflow-hidden">
            <Image
              src="/cuentos/mi-nueva-imagen.jpg"
              alt="Cuentos mágicos"
              fill
              className="object-cover animate-zoom-in"
              priority
            />
          <div className="relative container mx-auto px-4 text-center z-10">
            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl mb-4 bg-gradient-to-r from-gradient-start to-gradient-end bg-clip-text text-transparent drop-shadow-lg">
              Crea Cuentos Mágicos
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-white/90 mb-8">
              Transforma tus ideas en historias personalizadas con ilustraciones
              únicas. La herramienta perfecta para padres, educadores y
              pequeños soñadores.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/cuentos/crear/aprendizaje">
                  Empezar a Crear <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/cuentos/ejemplos">Ver Ejemplos</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-headline text-4xl md:text-5xl text-gray-800">
                Fácil como 1, 2, 3
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-muted-foreground mt-4">
                En solo unos pocos pasos, tendrás un cuento único y maravilloso
                listo para compartir.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {howItWorksSteps.map((step, index) => (
                <div key={index}>
                  <Image
                    src={step.icon.imageUrl}
                    alt={step.icon.description}
                    width={200}
                    height={200}
                    data-ai-hint={step.icon.imageHint}
                    className="mx-auto mb-4 rounded-full"
                  />
                  <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Example Stories Carousel Section */}
        <section id="examples" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-headline text-4xl md:text-5xl text-gray-800">
                Historias que Inspiran
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-muted-foreground mt-4">
                Echa un vistazo a algunos de los cuentos creados con Cuentia.
              </p>
            </div>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full max-w-5xl mx-auto"
            >
              <CarouselContent>
                {exampleStories.map((story) => (
                  <CarouselItem
                    key={story.id}
                    className="md:basis-1/2 lg:basis-1/3"
                  >
                    <div className="p-1">
                      <Card className="overflow-hidden">
                        <CardContent className="p-0">
                          <Image
                            src={story.image.imageUrl}
                            alt={story.title}
                            width={400}
                            height={600}
                            className="w-full h-auto object-cover aspect-[2/3]"
                            data-ai-hint={story.image.imageHint}
                          />
                          <div className="p-4">
                            <h3 className="font-bold text-lg">{story.title}</h3>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="precios" className="py-20 bg-card">
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

        {/* FAQ Section */}
        <section id="faq" className="py-20">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="font-headline text-4xl md:text-5xl text-gray-800">
                Preguntas Frecuentes
              </h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  ¿Cómo funciona la creación de avatares?
                </AccordionTrigger>
                <AccordionContent>
                  Simplemente subes varias fotos de una persona o mascota, y
                  nuestra IA generará un personaje de dibujos que podrás usar
                  como protagonista en todos tus cuentos.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>¿Qué son los créditos?</AccordionTrigger>
                <AccordionContent>
                  Los créditos son la moneda de Cuentia. Los usas para generar
                  cuentos e ilustraciones. Cada plan te da una cantidad
                  diferente de créditos para que des rienda suelta a tu
                  imaginación.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>
                  ¿Puedo usar los cuentos comercialmente?
                </AccordionTrigger>
                <AccordionContent>
                  Sí, con nuestros planes de suscripción, tienes plenos
                  derechos para usar los cuentos e ilustraciones generados como
                  desees, incluso para proyectos comerciales.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>
                  ¿Qué pasa si no uso todos mis créditos en un mes?
                </AccordionTrigger>
                <AccordionContent>
                  En los planes de suscripción, los créditos no utilizados no se
                  acumulan para el mes siguiente. ¡Es una excusa perfecta para
                  crear más historias!
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-headline text-4xl md:text-5xl lg:text-6xl text-gray-800">
              ¿Listo para Crear Magia?
            </h2>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground my-8">
              Únete a la comunidad de Cuentia y empieza a dar vida a las
              historias que siempre has imaginado. Tu próxima gran aventura te
              espera.
            </p>
            <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/registro">
                Regístrate Gratis <Sparkles className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
