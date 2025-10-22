'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, Sparkles, Loader2, X } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import AuthPopup from '@/components/core/AuthPopup';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface WebhookResponse {
    avatarUrl: string;
}

export default function CrearPersonajePage() {
    const { user, isUserLoading } = useUser();
    const [isPopupOpen, setPopupOpen] = useState(false);
    const [characterName, setCharacterName] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [generatedAvatar, setGeneratedAvatar] = useState<{name: string, url: string} | null>(null);


    useEffect(() => {
        const newPreviewUrls = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls(newPreviewUrls);

        return () => {
            newPreviewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [selectedFiles]);


    const handleInteraction = () => {
        if (!user && !isUserLoading) {
            setPopupOpen(true);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFiles(prevFiles => [...prevFiles, ...Array.from(event.target.files || [])]);
        }
    };

    const handleRemoveFile = (index: number) => {
        setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

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
        setGeneratedAvatar(null);

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
                 const errorText = await response.text();
                 throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
            }
            
            const result: WebhookResponse = await response.json();

            if (!result.avatarUrl) {
                throw new Error("La respuesta del servidor no incluyó una URL de avatar.");
            }
            
            setGeneratedAvatar({ name: characterName, url: result.avatarUrl });
            
            toast({
                title: '¡Avatar generado con éxito!',
                description: `El avatar "${characterName}" se ha creado y está listo.`,
            });
            
            setCharacterName('');
            setSelectedFiles([]);

        } catch (error) {
            console.error('Error al llamar al webhook:', error);
            const errorMessage = error instanceof Error ? error.message : 'Hubo un problema al contactar el servidor.';
            toast({
                variant: 'destructive',
                title: 'Error al generar el avatar',
                description: errorMessage,
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
                                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted"
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground">
                                        <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                                    </p>
                                    <p className="text-xs text-muted-foreground">Sube entre 5 y 10 fotos para mejores resultados</p>
                                </div>
                                <Input id="dropzone-file" type="file" className="hidden" multiple onChange={handleFileChange} accept="image/*" />
                            </Label>
                        </div> 
                    </div>

                    {previewUrls.length > 0 && (
                        <div className="space-y-2 text-left">
                            <Label className="text-lg font-semibold">Fotos Seleccionadas</Label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                                {previewUrls.map((url, index) => (
                                    <div key={index} className="relative group aspect-square">
                                        <Image
                                            src={url}
                                            alt={`Preview ${index + 1}`}
                                            width={150}
                                            height={150}
                                            className="rounded-md object-cover w-full h-full"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            onClick={() => handleRemoveFile(index)}
                                        >
                                            <X className="h-4 w-4" />
                                            <span className="sr-only">Eliminar imagen</span>
                                        </Button>
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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

                {generatedAvatar && (
                    <div className="mt-12 text-left border-t pt-8">
                        <h3 className="text-2xl font-bold text-center mb-6">¡Avatar Generado!</h3>
                        <Card className="max-w-xs mx-auto overflow-hidden shadow-lg">
                            <Image 
                                src={generatedAvatar.url}
                                alt={`Avatar para ${generatedAvatar.name}`}
                                width={400}
                                height={400}
                                className="w-full h-auto object-cover"
                            />
                            <CardHeader>
                                <CardTitle className="text-center">{generatedAvatar.name}</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
