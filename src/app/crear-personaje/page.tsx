'use client';

import { useState } from 'react';
import { useUser } from '@/firebase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, Sparkles, Loader2 } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import AuthPopup from '@/components/core/AuthPopup';
import { useToast } from '@/hooks/use-toast';

export default function CrearPersonajePage() {
    const { user, isUserLoading } = useUser();
    const [isPopupOpen, setPopupOpen] = useState(false);
    const [characterName, setCharacterName] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleInteraction = () => {
        if (!user && !isUserLoading) {
            setPopupOpen(true);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFiles(Array.from(event.target.files));
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Trigger auth popup if not logged in
        if (!user) {
            handleInteraction();
            return;
        }

        if (!characterName.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Por favor, introduce un nombre para el personaje.' });
            return;
        }
        if (selectedFiles.length === 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'Por favor, sube al menos una foto.' });
            return;
        }

        setIsLoading(true);

        const formData = new FormData();
        formData.append('characterName', characterName);
        selectedFiles.forEach((file) => {
            formData.append('images', file);
        });

        try {
            const response = await fetch('https://natuai-n8n.kl7z6h.easypanel.host/webhook/90d5d462-d86c-455b-88d6-39192765c718', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // The webhook seems to return HTML, so we just check for OK status.
            // If it returned JSON, you would parse it here: const result = await response.json();
            
            toast({
                title: '¡Avatar en proceso!',
                description: 'Tu avatar se está generando. Te notificaremos cuando esté listo.',
            });
            
            // Reset form
            setCharacterName('');
            setSelectedFiles([]);

        } catch (error) {
            console.error('Error calling webhook:', error);
            toast({
                variant: 'destructive',
                title: 'Error al generar el avatar',
                description: 'Hubo un problema al enviar tus datos. Por favor, inténtalo de nuevo más tarde.',
            });
        } finally {
            setIsLoading(false);
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
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2 text-left">
                        <Label htmlFor="avatar-name" className="text-lg font-semibold">Nombre del Personaje</Label>
                        <Input 
                            id="avatar-name" 
                            placeholder="Ej: Abuela Yoli, mi perro Tobi..."
                            value={characterName}
                            onChange={(e) => setCharacterName(e.target.value)}
                        />
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
                                    {selectedFiles.length > 0 ? (
                                        <p className="font-semibold text-primary">{selectedFiles.length} {selectedFiles.length === 1 ? 'archivo seleccionado' : 'archivos seleccionados'}</p>
                                    ) : (
                                        <>
                                            <p className="mb-2 text-sm text-muted-foreground">
                                                <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                                            </p>
                                            <p className="text-xs text-muted-foreground">Sube entre 5 y 10 fotos para mejores resultados</p>
                                        </>
                                    )}
                                </div>
                                <Input id="dropzone-file" type="file" className="hidden" multiple onChange={handleFileChange} />
                            </Label>
                        </div> 
                    </div>
                     <Button type="submit" size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 z-20 relative" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Generando...
                            </>
                        ) : (
                            <>
                                Generar Avatar <Sparkles className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}
