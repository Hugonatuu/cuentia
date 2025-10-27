
'use client';

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
import { Sparkles, BookText } from "lucide-react";
import placeholderImages from "@/lib/placeholder-images.json";
import {
  exampleStories,
  pricingPlans,
} from "@/lib/placeholder-data";
import PricingCard from "./components/PricingCard";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import * as React from "react";

export default function Home() {

  const characterImages = [
    "https://replicate.delivery/xezq/YMjNRS6q8ToTNpGc0BwccmJ5rp8ZVPPcL3xHAsDlvUwFVbYF/tmprddbkgrm.jpeg",
    "https://replicate.delivery/xezq/KnJIaaGSy1ZINBFqbOBhphXjKVdg580RF55VffOAMQzuWthVA/tmpniscmvpg.jpeg",
    "https://replicate.delivery/xezq/OYOYNSYYtgoeGq25TSpWQVH1w407I35riGV4tegt9ftsZbDrA/tmp5wl33ynn.jpeg",
    "https://replicate.delivery/xezq/KCS09DBHCN6iK9ioDYFbGUBU9BJXvTeuHGwpYk6MNPffgaDrA/tmptmvq6ud7.jpeg"
  ];

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
            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl mb-4 bg-gradient-to-r from-gradient-start to-gradient-end bg-clip-text text-transparent drop-shadow-lg animate-in fade-in slide-in-from-top-4 duration-1000 ease-in-out">
              Crea cuentos que cobran vida en segundos
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-blue-900 mb-8 font-open-sans font-semibold animate-in fade-in slide-in-from-top-4 duration-1000 ease-in-out delay-200">
              Tu imaginación y la inteligencia artificial se unen para transformar unas pocas palabras en una historia mágica llena de ilustraciones.
            </p>
            <div className="flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-in-out delay-400">
              <Button size="lg" asChild className="h-14 px-10 text-lg">
                <Link href="/cuentos/crear/aprendizaje">
                  ✨ Crear mi Cuento ✨
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-card overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-headline text-4xl md:text-5xl text-gray-800">
                CÓMO FUNCIONA
              </h2>
            </div>
            <div className="relative grid md:grid-cols-2 gap-16 items-center">
              <div className="relative h-[400px] flex items-center justify-center">
                {/* Background Blobs */}
                <div className="absolute -top-10 -left-20 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob"></div>
                <div className="absolute -bottom-10 -right-20 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-2000"></div>

                {/* Image collage */}
                <div className="relative z-10">
                  <Card className="absolute -top-16 -left-40 p-2 bg-white shadow-xl rotate-[-15deg] transform hover:scale-110 transition-transform duration-300">
                    <Image
                      src="https://replicate.delivery/xezq/KCS09DBHCN6iK9ioDYFbGUBU9BJXvTeuHGwpYk6MNPffgaDrA/tmptmvq6ud7.jpeg"
                      alt="Transformación de foto a personaje"
                      width={200}
                      height={200}
                      className="rounded"
                    />
                  </Card>
                  <Card className="relative p-2 bg-white shadow-2xl rotate-[5deg] transform hover:scale-110 transition-transform duration-300">
                    <Image
                      src="https://replicate.delivery/xezq/Kz3kDfIH8gxWXy5PDDnX4vlxL7OTsec1EQtdWPJ3TmfLf1GWB/tmp4c8ladyg.jpeg"
                      alt="Personaje de dibujos animados"
                      width={220}
                      height={220}
                      className="rounded"
                    />
                  </Card>
                </div>
              </div>
              <div className="z-10 text-center md:text-left">
                <Card className="inline-block p-8 bg-background shadow-xl border-2 border-primary/20 relative overflow-hidden">
                    <div className="absolute -top-10 -left-20 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob"></div>
                     <div className="relative z-10">
                        <h3 className="font-headline text-3xl md:text-4xl text-primary mb-4">
                        1. CREA TU PERSONAJE
                        </h3>
                        <p className="text-lg text-muted-foreground mb-6">
                        Sube una foto, Crea una versión mágica de ti, de tu mascota o de quien tú quieras… ¡y tantos personajes como imagines!
                        </p>
                        <Button asChild>
                        <Link href="/crear-personaje">Crear un Personaje</Link>
                        </Button>
                    </div>
                </Card>
              </div>
            </div>

            <div className="relative grid md:grid-cols-2 gap-16 items-center mt-20">
              <div className="z-10 text-center md:text-left">
                <Card className="inline-block p-8 bg-background shadow-xl border-2 border-primary/20 relative overflow-hidden">
                    <div className="absolute -top-10 -left-20 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-4000"></div>
                     <div className="relative z-10">
                        <h3 className="font-headline text-3xl md:text-4xl text-primary mb-4">
                        2. Elige que personaje quieres que aparezcan en tu cuento
                        </h3>
                        <p className="text-lg text-muted-foreground mb-6">
                        Puedes elegir entre los personajes que has creado, o usar los personajes predefinidos de Cuentia. ¡Combínalos como quieras!
                        </p>
                        <Button asChild>
                        <Link href="/personajes">Ver Personajes</Link>
                        </Button>
                    </div>
                </Card>
              </div>
              <div className="relative h-[400px] flex items-center justify-center">
                <div className="absolute -top-10 -right-20 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-6000"></div>

                <div className="relative z-10 w-full max-w-sm">
                   <Carousel
                      plugins={[
                        Autoplay({
                          delay: 4000,
                          stopOnInteraction: true,
                        }),
                      ]}
                      opts={{
                        align: "start",
                        loop: true,
                      }}
                    >
                      <CarouselContent>
                        {characterImages.map((src, index) => (
                          <CarouselItem key={index}>
                            <Card className="overflow-hidden">
                              <CardContent className="p-0">
                                <Image
                                  src={src}
                                  alt={`Personaje de ejemplo ${index + 1}`}
                                  width={400}
                                  height={400}
                                  className="rounded-lg object-cover aspect-square"
                                />
                              </CardContent>
                            </Card>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
                      <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
                    </Carousel>
                </div>
              </div>
            </div>
            
            <div className="relative grid md:grid-cols-1 gap-16 items-center mt-20">
                <div className="z-10 text-center md:col-span-1">
                    <Card className="inline-block p-8 bg-background shadow-xl border-2 border-primary/20 relative overflow-hidden h-full">
                        <div className="absolute -top-10 -left-20 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob"></div>
                        <div className="relative z-10">
                            <h3 className="font-headline text-3xl md:text-4xl text-primary mb-4">
                                3. Escribe puntos clave y el objetivo de aprendizaje
                            </h3>
                            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                            ¡Deja volar tu imaginación! Añade los puntos clave de la trama, un objetivo de aprendizaje y dale tu toque personal a la historia.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>

             <div className="relative grid md:grid-cols-1 gap-16 items-center mt-20">
              <div className="z-10 text-center md:col-span-1">
                <Card className="inline-block p-8 bg-background shadow-xl border-2 border-primary/20 relative overflow-hidden">
                    <div className="absolute -top-10 -left-20 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-4000"></div>
                     <div className="relative z-10">
                        <h3 className="font-headline text-3xl md:text-4xl text-primary mb-4">
                        4. Añade los últimos detalles de personalización a tu libro
                        </h3>
                        <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                        Añade una dedicatoria especial y una imagen en la parte de atrás de tu cuento para hacerlo todavía más único.
                        </p>
                    </div>
                </Card>
              </div>
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
                  nuestra IA generará un personaje de dibujos animados que podrás usar
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

    