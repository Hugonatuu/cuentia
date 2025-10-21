import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud } from "lucide-react";

export default function CrearAvatarPage() {
  return (
    <div className="max-w-2xl mx-auto">
        <Card className="text-center">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Crea tu Avatar Personalizado</CardTitle>
                <CardDescription>
                    Sube algunas fotos y convierte a un ser querido (¡o a tu mascota!) en el héroe de un cuento.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="avatar-name" className="text-lg font-semibold">Nombre del Personaje</Label>
                    <Input id="avatar-name" placeholder="Ej: Abuelo Pepe, mi perro Tobi..." />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="photos" className="text-lg font-semibold">Sube tus Fotos</Label>
                    <div className="flex items-center justify-center w-full">
                        <Label
                            htmlFor="dropzone-file"
                            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted"
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground">
                                    <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                                </p>
                                <p className="text-xs text-muted-foreground">Sube entre 5 y 10 fotos para mejores resultados</p>
                            </div>
                            <Input id="dropzone-file" type="file" className="hidden" multiple />
                        </Label>
                    </div> 
                </div>
                 <Button type="submit" size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Generar Avatar
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
