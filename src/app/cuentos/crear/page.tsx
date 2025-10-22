
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const storyCategory = {
  title: '¡CREA UN CUENTO CON EL OBJETIVO DE APRENDIZAJE QUE TU QUIERAS!',
  description: 'Crea un cuento único con ilustraciones y portada.',
  href: '/cuentos/crear/aprendizaje',
  icon: BookOpen,
  isFeatured: true,
};

export default function CrearCuentoSeleccionPage() {
  return (
    <div className="container mx-auto max-w-5xl py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl text-gray-800">
          Elige tu Aventura Creativa
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground mt-4">
          ¿Cuánta magia visual quieres en tu historia? Cada tipo de cuento
          ofrece una experiencia única.
        </p>
      </div>
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <Link href={storyCategory.href} className="block group">
            <Card
              className={cn(
                'h-full flex flex-col transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1',
                storyCategory.isFeatured
                  ? 'bg-primary/10 border-primary'
                  : 'bg-card'
              )}
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <storyCategory.icon className="w-8 h-8 text-primary" />
                  <CardTitle className="text-2xl">{storyCategory.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <CardDescription className="text-base mb-6">
                  {storyCategory.description}
                </CardDescription>
                <div className="flex justify-end items-center text-sm font-semibold text-primary">
                  Empezar a crear <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
