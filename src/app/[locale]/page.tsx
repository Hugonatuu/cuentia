
'use client';

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
import { Sparkles } from "lucide-react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import * as React from "react";
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { communityStoriesCollectionRef } from '@/firebase/firestore/references';
import { Skeleton } from "@/components/ui/skeleton";
import { Locale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface CommunityStory {
  id: string;
  title: string;
  coverImageUrl: string;
  urlPage: string;
}

export default function Home({params}: PageProps<'/[locale]'>) {
  const t = useTranslations('HomePage')
  const firestore = useFirestore();
  
  const communityStoriesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return communityStoriesCollectionRef(firestore);
  }, [firestore]);

  const { data: stories, isLoading } = useCollection<CommunityStory>(communityStoriesQuery);


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
              src="https://cuentia.s3.eu-north-1.amazonaws.com/De+la+web/mi-nueva-imagen.jpg"
              alt="Cuentos mágicos"
              fill
              className="object-cover animate-zoom-in"
              priority
            />
          <div className="relative container mx-auto px-4 text-center z-10">
            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl mb-4 bg-gradient-to-r from-gradient-start to-gradient-end bg-clip-text text-transparent drop-shadow-lg animate-in fade-in slide-in-from-top-4 duration-1000 ease-in-out">
               {t('title')}
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-blue-900 mb-8 font-open-sans font-semibold animate-in fade-in slide-in-from-top-4 duration-1000 ease-in-out delay-200">
            {t('subtitle')}            </p>
            <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-in-out delay-400">
              <Button size="lg" asChild className="h-16 px-12 text-xl mt-4">
                <Link href="/cuentos/crear/aprendizaje">
                  {t('cta')}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-card overflow-hidden relative">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-300/50 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-pink-300/50 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-yellow-300/30 rounded-full mix-blend-multiply filter blur-2xl opacity-75 animate-blob animation-delay-4000"></div>
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-300/30 rounded-full mix-blend-multiply filter blur-2xl opacity-75 animate-blob animation-delay-1000"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <h2 className="font-headline text-4xl md:text-5xl text-gray-800">
                {t('howItWorksTitle')}
              </h2>
            </div>
            <div className="relative grid md:grid-cols-2 gap-16 items-center">
              <div className="relative h-[400px] flex items-center justify-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                
                {/* Image collage */}
                <div className="relative z-10 scale-90 md:scale-100">
                  <Card className="absolute -top-16 -left-20 md:-left-40 p-2 bg-white shadow-xl rotate-[-15deg] transform hover:scale-110 transition-transform duration-300">
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
                <Card className="inline-block p-8 bg-background shadow-xl border-2 border-primary/20 relative overflow-hidden h-full transition-transform duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                     <div className="relative z-10">
                        <h3 className="font-headline text-3xl md:text-4xl text-primary mb-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        {t('step1Title')}
                        </h3>
                        <p className="text-lg text-muted-foreground mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                        {t('step1Description')}
                        </p>
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
                          <Button asChild>
                            <Link href="/crear-personaje">{t('step1Cta')}</Link>
                          </Button>
                        </div>
                    </div>
                </Card>
              </div>
            </div>

            <div className="relative grid md:grid-cols-2 gap-16 items-center mt-20">
              <div className="z-10 text-center md:text-left animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                <Card className="inline-block p-8 bg-background shadow-xl border-2 border-primary/20 relative overflow-hidden h-full transition-transform duration-300 hover:scale-105">
                     <div className="relative z-10">
                        <h3 className="font-headline text-3xl md:text-4xl text-primary mb-4">
                        {t('step2Title')}
                        </h3>
                        <p className="text-lg text-muted-foreground mb-6">
                        {t('step2Description')}
                        </p>
                        <Button asChild>
                        <Link href="/personajes">{t('step2Cta')}
                        </Link>
                        </Button>
                    </div>
                </Card>
              </div>
              <div className="relative h-[400px] flex items-center justify-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
                
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
                <div className="z-10 text-center md:col-span-1 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
                    <Card className="inline-block p-8 bg-background shadow-xl border-2 border-primary/20 relative overflow-hidden h-full transition-transform duration-300 hover:scale-105">
                        <div className="relative z-10">
                            <h3 className="font-headline text-3xl md:text-4xl text-primary mb-4">
                                {t('step3Title')}
                            </h3>
                            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                            {t('step3Description')}
                            </p>
                        </div>
                    </Card>
                </div>
            </div>

             <div className="relative grid md:grid-cols-1 gap-16 items-center mt-20">
              <div className="z-10 text-center md:col-span-1 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-600">
                <Card className="inline-block p-8 bg-background shadow-xl border-2 border-primary/20 relative overflow-hidden h-full transition-transform duration-300 hover:scale-105">
                     <div className="relative z-10">
                        <h3 className="font-headline text-3xl md:text-4xl text-primary mb-4">
                        {t('step4Title')}
                        </h3>
                        <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                        {t('step4Description')}
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
              <h2 className="font-headline text-4xl md:text-5xl text-gray-800 animate-in fade-in zoom-in-95 duration-500">
              {t('examplesTitle')}
              </h2>
            </div>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 2000,
                  stopOnInteraction: true,
                }),
              ]}
              className="w-full max-w-6xl mx-auto"
            >
              <CarouselContent>
                {isLoading && (
                    [...Array(5)].map((_, index) => (
                        <CarouselItem key={index} className="basis-1/2 md:basis-1/3 lg:basis-1/5">
                            <div className="p-1">
                                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                            </div>
                        </CarouselItem>
                    ))
                )}
                {!isLoading && stories && stories.map((story) => (
                  <CarouselItem
                    key={story.id}
                    className="basis-1/2 md:basis-1/3 lg:basis-1/5"
                  >
                    <div className="p-1">
                       <Link href={`/comunidad/leer/${story.urlPage}`}>
                          <Card className="overflow-hidden group">
                            <CardContent className="p-0">
                              <Image
                                src={story.coverImageUrl}
                                alt={story.title}
                                width={400}
                                height={600}
                                className="w-full h-auto object-cover aspect-[2/3] transition-transform duration-300 group-hover:scale-105"
                              />
                            </CardContent>
                          </Card>
                       </Link>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
             {!isLoading && (!stories || stories.length === 0) && (
                <div className="text-center text-muted-foreground py-10">
                    No hay cuentos en la comunidad todavía.
                </div>
            )}
             <div className="text-center mt-8">
              <p className="max-w-2xl mx-auto text-lg text-gray-800 mt-4">
                {t('findStoriestitle')}
              </p>
              <Button asChild className="mt-4">
                <Link href="/comunidad">
                  {t('communityStories')}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="font-headline text-4xl md:text-5xl text-primary">
              {t('faqTitle')}
              </h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg">
                {t('faq1Question')}
                </AccordionTrigger>
                <AccordionContent className="text-base">
                {t('faq1Answer')}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg">{t('faq2Question')}
                </AccordionTrigger>
                <AccordionContent className="text-base">
                {t('faq2Answer')}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-lg">
                {t('faq3Question')}
                </AccordionTrigger>
                <AccordionContent className="text-base">
                {t('faq3Answer')}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-lg">
                {t('faq4Question')}
                </AccordionTrigger>
                <AccordionContent className="text-base">
                {t('faq4Answer')}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-headline text-4xl md:text-5xl lg:text-6xl text-gray-800">
              {t('finalCtaTitle')}
            </h2>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-primary my-8">
            {t('finalCtaDescription')}
            </p>
            <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/registro">
              {t('finalCtaButton')}
              <Sparkles className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
