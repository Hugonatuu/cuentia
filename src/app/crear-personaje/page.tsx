
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UploadCloud, Sparkles, Loader2, X, CreditCard } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import AuthPopup from '@/components/core/AuthPopup';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { serverTimestamp } from 'firebase/firestore';
import { userCharactersCollectionRef } from '@/firebase/firestore/references';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


interface WebhookResponse {
    avatarUrl: string;
}

export default function CrearPersonajePage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [isPopupOpen, setPopupOpen] = useState(false);
    const [characterName, setCharacterName] = useState('');
    const [species, setSpecies] = useState('');
    const [otherSpecies, setOtherSpecies] = useState('');
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
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
            const files = Array.from(event.target.files);
            const totalFiles = selectedFiles.length + files.length;
            if (totalFiles > 4) {
                toast({
                    variant: 'destructive',
                    title: 'Límite de fotos alcanzado',
                    description: 'Puedes subir un máximo de 4 fotos.',
                });
                const needed = 4 - selectedFiles.length;
                if (needed > 0) {
                    setSelectedFiles(prev => [...prev, ...files.slice(0, needed)]);
                }
            } else {
                setSelectedFiles(prev => [...prev, ...files]);
            }
             // Reset file input to allow re-selection of the same file
            event.target.value = '';
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
        
        if (!firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'La base de datos no está disponible. Inténtalo de nuevo.' });
            return;
        }

        const finalSpecies = species === 'Otro' ? otherSpecies.trim() : species;

        if (!characterName.trim() || !finalSpecies || !gender || !age.trim()) {
            toast({ variant: 'destructive', title: 'Campos incompletos', description: 'Por favor, completa todos los campos del personaje.' });
            return;
        }
        if (selectedFiles.length < 2 || selectedFiles.length > 4) {
            toast({ variant: 'destructive', title: 'Fotos insuficientes', description: 'Por favor, sube entre 2 y 4 fotos para generar el avatar.' });
            return;
        }

        setIsLoading(true);
        setGeneratedAvatar(null);

        const formData = new FormData();
        formData.append('characterName', characterName.trim());
        formData.append('species', finalSpecies);
        formData.append('gender', gender);
        formData.append('age', age.trim());
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
            
            // Guardar en Firestore
            const charactersColRef = userCharactersCollectionRef(firestore, user.uid);
            addDocumentNonBlocking(charactersColRef, {
                name: characterName.trim(),
                avatarUrl: result.avatarUrl,
                species: finalSpecies,
                gender,
                age: age.trim(),
                createdAt: serverTimestamp()
            });
            
            setGeneratedAvatar({ name: characterName, url: result.avatarUrl });
            
            toast({
                title: '¡Avatar generado y guardado!',
                description: `El avatar "${characterName.trim()}" se ha guardado en tu colección.`,
            });
            
            setCharacterName('');
            setSpecies('');
            setOtherSpecies('');
            setGender('');
            setAge('');
            setSelectedFiles([]);

        } catch (error) {
            console.error('Error al llamar al webhook o guardar en Firestore:', error);
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
            <div className="container mx-auto max-w-5xl py-12">
                <div className="text-center mb-12">
                  <Skeleton className="h-12 w-3/4 mx-auto" />
                  <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
                </div>
                <Card className="shadow-lg p-8">
                  <div className="space-y-8">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <div className="grid grid-cols-2 gap-6">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-32 w-full" />
                    <div className="flex justify-center">
                      <Skeleton className="h-12 w-48" />
                    </div>
                  </div>
                </Card>
            </div>
        )
    }

  return (
    <div className="container mx-auto max-w-5xl py-12">
        <AuthPopup
            isOpen={isPopupOpen}
            onOpenChange={setPopupOpen}
            title="Regístrate para crear tu personaje"
            description="¡Regístrate y comienza a generar tus propios avatares para tus historias!"
            actionText="Registrarse"
            redirectPath="/registro"
        />
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl text-gray-800">
            Crea tu Avatar Personalizado
          </h1>
          <p className="max-w-xl mx-auto text-primary mt-4 font-body">
             Sube algunas fotos y convierte a un ser querido (¡o a tu mascota!) en el héroe de un cuento.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <Card className="shadow-lg relative">
            {!isUserLoading && !user && (
                <div
                    className="absolute inset-0 z-10 bg-transparent cursor-pointer"
                    onClick={handleInteraction}
                />
            )}
            <CardHeader>
                <CardTitle className="text-2xl font-semibold">1. Datos del Personaje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div className="space-y-2">
                        <Label htmlFor="avatar-name">Nombre del Personaje</Label>
                        <Input 
                            id="avatar-name" 
                            placeholder="Ej: Jack, Ana, Mr Thompson..."
                            value={characterName}
                            onChange={(e) => setCharacterName(e.target.value)}
                            required
                            maxLength={50}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="species">Especie</Label>
                         <Select value={species} onValueChange={setSpecies} required>
                            <SelectTrigger id="species">
                                <SelectValue placeholder="Selecciona una especie" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Humano">Humano</SelectItem>
                                <SelectItem value="Perro">Perro</SelectItem>
                                <SelectItem value="Gato">Gato</SelectItem>
                                <SelectItem value="Pájaro">Pájaro</SelectItem>
                                <SelectItem value="Conejo">Conejo</SelectItem>
                                <SelectItem value="Hámster">Hámster</SelectItem>
                                <SelectItem value="Pez">Pez</SelectItem>
                                <SelectItem value="Otro">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {species === 'Otro' && (
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="other-species">Especifica la especie</Label>
                            <Input
                                id="other-species"
                                placeholder="Ej: Dinosaurio, Dragón..."
                                value={otherSpecies}
                                onChange={(e) => setOtherSpecies(e.target.value)}
                                required
                                maxLength={50}
                            />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="gender">Género</Label>
                         <Select value={gender} onValueChange={setGender} required>
                            <SelectTrigger id="gender">
                                <SelectValue placeholder="Selecciona un género" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="masculino">Masculino</SelectItem>
                                <SelectItem value="femenino">Femenino</SelectItem>
                                <SelectItem value="neutro">Neutro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="age">Edad</Label>
                        <Input 
                            id="age" 
                            placeholder="Ej: 7, adulto, cachorro..."
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            required
                            maxLength={30}
                        />
                    </div>
                </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg relative">
             {!isUserLoading && !user && (
                <div
                    className="absolute inset-0 z-10 bg-transparent cursor-pointer"
                    onClick={handleInteraction}
                />
            )}
            <CardHeader>
                <CardTitle className="text-2xl font-semibold">2. Sube las Fotos ({selectedFiles.length}/4)</CardTitle>
                 <CardDescription className="text-sm font-semibold text-center text-destructive">
                    Sube entre 2 y 4 fotos. Al menos una foto tiene que ser de cuerpo entero.
                </CardDescription> 
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center w-full">
                    <Label
                        htmlFor="dropzone-file"
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg bg-card",
                            selectedFiles.length < 4 ? "cursor-pointer hover:bg-muted" : "cursor-not-allowed opacity-50"
                        )}
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                            </p>
                        </div>
                        <Input 
                            id="dropzone-file" 
                            type="file" 
                            className="hidden" 
                            multiple 
                            onChange={handleFileChange} 
                            accept="image/*"
                            disabled={selectedFiles.length >= 4}
                        />
                    </Label>
                </div>
                 {previewUrls.length > 0 && (
                    <div className="space-y-2 text-left mt-6">
                        <Label>Fotos Seleccionadas</Label>
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
            </CardContent>
          </Card>
          
          <div className="flex flex-col items-center justify-center gap-4 pt-4 sticky bottom-6 z-20">
              <Card className="p-2 px-3 flex items-center gap-2 shadow-lg bg-accent/50">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span className="text-sm font-bold text-primary">
                      Coste Total: 500 créditos
                  </span>
              </Card>
              <Button type="submit" size="lg" className="shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/50 hover:-translate-y-0.5" disabled={isLoading}>
                  {isLoading ? (
                      <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Generando...
                      </>
                  ) : (
                      <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Generar mi Avatar Mágico
                      </>
                  )}
              </Button>
            </div>
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
    </div>
  );
}

    
