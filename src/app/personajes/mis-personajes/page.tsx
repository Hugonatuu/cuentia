'use client';

import { predefinedCharacters } from '@/lib/placeholder-data';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

export default function MisPersonajesPage() {
  // TODO: Replace with user's actual characters
  const userCharacters = predefinedCharacters.slice(0, 4);

  return (
    <div>
      {userCharacters.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {userCharacters.map((character) => (
            <Card
              key={character.id}
              className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <CardContent className="p-0 text-center">
                <div className="aspect-square overflow-hidden">
                  <Image
                    src={character.image.imageUrl}
                    alt={character.name}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    data-ai-hint={character.image.imageHint}
                  />
                </div>
                <div className="py-3 px-2">
                  <h3 className="font-semibold text-md">{character.name}</h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold text-gray-700">
            Aún no has creado ningún personaje
          </h2>
          <p className="text-muted-foreground mt-2">
            ¡Dirígete a la sección de "Crear Avatar" para empezar a dar vida a
            tus protagonistas!
          </p>
        </div>
      )}
    </div>
  );
}
