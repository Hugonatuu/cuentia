'use client';

import { useState } from 'react';
import { useUser } from '@/firebase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, Sparkles } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import AuthPopup from '@/components/core/AuthPopup';

export default function CrearPersonajePage() {
    const { user, isUserLoading } = useUser();
    const [isPopupOpen, setPopupOpen] = useState(false);

    const handleInteraction = () => {
        if (!user && !isUserLoading) {
            setPopupOpen(true);
        }
    };
    
    if (isUserLoading) {
        return (
            <div className="container mx-auto max-w-2xl py-12">
                <Card>
                    <CardHeader className="text-center">
                        <Skeleton className="h-10 w-3/4 mx-auto" />
                        <Skeleton className="h-6 w-full mx-auto mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="space-y-2">
                           <Skeleton className="h-6 w-40" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                         <div className="space-y-2">
                           <Skeleton className="h-6 w-48" />
                           <Skeleton className="h-64 w-full" />
                        </div>
                        <div className="text-center">
                            <Skeleton className="h-12 w-48 mx-auto" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

  return (
    <div className="container mx-auto max-w-2xl py-12">
        <AuthPopup
            isOpen={isPopupOpen}
            onOpenChange={setPopupOpen}
            title="Regístrate para crear tu personaje"
            description="¡Regístrate y comienza a generar tus propios avatares para tus historias!"
            actionText="Registrarse"
            redirectPath="/registro"
        />
        <Card className="text-center shadow-lg relative">
             {!isUserLoading && !user && (
                <div
                    className="absolute inset-0 z-10 bg-transparent cursor-pointer"
                    onClick={handleInteraction}
                />
            )}
            <CardHeader>
                <CardTitle className="font-headline text-4xl md:text-5xl text-gray-800">Crea tu Avatar Personalizado</CardTitle>
                <CardDescription className="text-lg">
                    Sube algunas fotos y convierte a un ser querido (¡o a tu mascota!) en el héroe de un cuento.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2 text-left">
                    <Label htmlFor="avatar-name" className="text-lg font-semibold">Nombre del Personaje</Label>
                    <Input id="avatar-name" placeholder="Ej: Abuela Yoli, mi perro Tobi..." />
                </div>
                <div className="space-y-2 text-left">
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
                 <Button type="submit" size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 z-20 relative">
                    Generar Avatar <Sparkles className="ml-2 h-5 w-5" />
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
