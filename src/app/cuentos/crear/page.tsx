import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";

export default function CrearCuentoPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-4xl md:text-5xl text-gray-800">
            Crea Tu Próximo Cuento
          </CardTitle>
          <CardDescription className="text-lg">
            Rellena los detalles y deja que la magia haga el resto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-lg font-semibold">Título del Cuento</Label>
              <Input id="title" placeholder="El misterio del bosque encantado" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="objective" className="text-lg font-semibold">Objetivo de Aprendizaje</Label>
              <Textarea id="objective" placeholder="Ej: Enseñar la importancia de la amistad y el trabajo en equipo." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="age" className="text-lg font-semibold">Edad del Lector</Label>
                    <Select>
                        <SelectTrigger id="age">
                            <SelectValue placeholder="Selecciona una edad" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="3-5">3-5 años</SelectItem>
                            <SelectItem value="6-8">6-8 años</SelectItem>
                            <SelectItem value="9-12">9-12 años</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="reader-name" className="text-lg font-semibold">Nombre del Lector (Opcional)</Label>
                    <Input id="reader-name" placeholder="Leo" />
                </div>
            </div>
            <div>
              <Label className="text-lg font-semibold mb-2 block">Personajes (hasta 4)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Personaje 1: Un zorro astuto llamado Fígaro" />
                <Input placeholder="Personaje 2: Una osa sabia llamada Úrsula" />
                <Input placeholder="Personaje 3" />
                <Input placeholder="Personaje 4" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-lg font-semibold">Puntos Clave de la Trama</Label>
              <Textarea id="prompt" placeholder="Describe los eventos principales, giros o el mensaje que quieres transmitir." rows={4} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="start-phrase" className="text-lg font-semibold">Frase Inicial (Opcional)</Label>
                    <Input id="start-phrase" placeholder="Érase una vez en un reino muy lejano..." />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="end-phrase" className="text-lg font-semibold">Frase Final (Opcional)</Label>
                    <Input id="end-phrase" placeholder="...y vivieron felices para siempre." />
                </div>
            </div>
            <div className="text-center pt-4">
                <Button type="submit" size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Generar mi Cuento <Sparkles className="ml-2 h-5 w-5" />
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
