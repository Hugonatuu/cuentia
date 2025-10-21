import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { predefinedCharacters } from "@/lib/placeholder-data";

export default function PredefinidosPage() {
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {predefinedCharacters.map((character) => (
          <Card key={character.id} className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
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
    </div>
  );
}
