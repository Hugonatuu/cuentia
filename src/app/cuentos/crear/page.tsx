
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BookOpen, Image as ImageIcon, Book } from 'lucide-react';
import { cn } from '@/lib/utils';

const storyCategories = [
  {
    title: 'Cuento 100% Ilustrado',
    description: 'Añade 20 imágenes más la portada para ilustrar tu cuento de la mejor manera posible.',
    href: '/cuentos/crear/ilustrado-20',
    icon: ImageIcon,
    isFeatured: true,
  },
  {
    title: 'Cuento Ilustrado',
    description: 'Añade 12 imágenes más la portada a tu cuento.',
    href: '/cuentos/crear/ilustrado-12',
    icon: ImageIcon,
    isFeatured: false,
  },
  {
    title: 'Cuento con Imágenes',
    description: 'Crea un cuento con 5 imágenes más la portada.',
    href: '/cuentos/crear/ilustrado-5',
    icon: ImageIcon,
    isFeatured: false,
  },
  {
    title: 'Cuento sin Ilustraciones',
    description: 'Solamente la portada. Ideal para lectores que aman imaginar.',
    href: '/cuentos/crear/solo-portada',
    icon: Book,
    isFeatured: false,
  },
];

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {storyCategories.map((category) => (
          <Link href={category.href} key={category.href} className="block group">
            <Card
              className={cn(
                'h-full flex flex-col transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1',
                category.isFeatured
                  ? 'bg-primary/10 border-primary'
                  : 'bg-card'
              )}
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <category.icon className="w-8 h-8 text-primary" />
                  <CardTitle className="text-2xl">{category.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <CardDescription className="text-base mb-6">
                  {category.description}
                </CardDescription>
                <div className="flex justify-end items-center text-sm font-semibold text-primary">
                  Empezar a crear <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
