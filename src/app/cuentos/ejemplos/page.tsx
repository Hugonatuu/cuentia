import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exampleStories } from "@/lib/placeholder-data";

export default function EjemplosPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl text-gray-800">
          Galería de la Imaginación
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground mt-4">
          Explora los mundos creados con Cuentia. Cada historia es una puerta a una nueva aventura o a un nuevo aprendizaje.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {exampleStories.map((story) => (
          <Card key={story.id} className="overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl flex flex-col">
            <Link href={story.pdfUrl || '#'} target="_blank" rel="noopener noreferrer" className="block">
              <CardContent className="p-0">
                <Image
                  src={story.image.imageUrl}
                  alt={story.title}
                  width={400}
                  height={600}
                  className="w-full h-auto object-cover aspect-[2/3]"
                  data-ai-hint={story.image.imageHint}
                />
              </CardContent>
              <CardHeader>
                <CardTitle className="text-lg text-center">{story.title}</CardTitle>
              </CardHeader>
            </Link>
            <CardFooter className="mt-auto p-4">
              <Button asChild className="w-full" variant={!story.pdfUrl || story.pdfUrl === '#' ? 'secondary' : 'default'} disabled={!story.pdfUrl || story.pdfUrl === '#'}>
                <a href={story.pdfUrl} download>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
