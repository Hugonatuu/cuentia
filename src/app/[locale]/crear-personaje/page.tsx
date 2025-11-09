'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UploadCloud, Sparkles, Loader2, X, CreditCard, Wand } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import AuthPopup from '@/components/core/AuthPopup';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { serverTimestamp, runTransaction, doc } from 'firebase/firestore';
import { userCharactersCollectionRef, userDocRef } from '@/firebase/firestore/references';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getPlanLimits } from '@/lib/plans';
import { useTranslations } from 'next-intl';

interface WebhookResponse {
    avatarUrl: string;
}

interface UserProfile {
    stripeRole?: string;
    monthlyCreditCount?: number;
    payAsYouGoCredits?: number;
}


const AVATAR_CREDIT_COST = 300;

const speciesTranslations = {
    human: { es: 'Humano', en: 'Human', it: 'Umano', fr: 'Humain', de: 'Mensch', pt: 'Humano' },
    dog: { es: 'Perro', en: 'Dog', it: 'Cane', fr: 'Chien', de: 'Hund', pt: 'Cachorro' },
    cat: { es: 'Gato', en: 'Cat', it: 'Gatto', fr: 'Chat', de: 'Katze', pt: 'Gato' },
    bird: { es: 'Pájaro', en: 'Bird', it: 'Uccello', fr: 'Oiseau', de: 'Vogel', pt: 'Pássaro' },
    rabbit: { es: 'Conejo', en: 'Rabbit', it: 'Coniglio', fr: 'Lapin', de: 'Kaninchen', pt: 'Coelho' },
    hamster: { es: 'Hámster', en: 'Hamster', it: 'Criceto', fr: 'Hamster', de: 'Hamster', pt: 'Hamster' },
    fish: { es: 'Pez', en: 'Fish', it: 'Pesce', fr: 'Poisson', de: 'Fisch', pt: 'Peixe' },
};

const genderTranslations = {
    male: { es: 'Masculino', en: 'Male', it: 'Maschio', fr: 'Masculin', de: 'Männlich', pt: 'Masculino' },
    female: { es: 'Femenino', en: 'Female', it: 'Femmina', fr: 'Féminin', de: 'Weiblich', pt: 'Feminino' },
    neutral: { es: 'Neutro', en: 'Neutral', it: 'Neutro', fr: 'Neutre', de: 'Neutral', pt: 'Neutro' },
};

export default function CrearPersonajePage() {
    const t = useTranslations('CrearPersonajePage');
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
    const [isGenerationModalOpen, setGenerationModalOpen] = useState(false);


    const userRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return userDocRef(firestore, user.uid);
    }, [firestore, user]);

    const { data: userProfile } = useDoc<UserProfile>(userRef);

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
                    title: t('errors.photoLimit'),
                    description: t('errors.photoLimitDescription'),
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

    const resetForm = () => {
        setCharacterName('');
        setSpecies('');
        setOtherSpecies('');
        setGender('');
        setAge('');
        setSelectedFiles([]);
        setGeneratedAvatar(null);
    }


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!user || !userProfile) {
            handleInteraction();
            return;
        }
        
        if (!firestore) {
            toast({ variant: 'destructive', title: 'Error', description: t('errors.database') });
            return;
        }

        const isOtherSpecies = species === t('characterData.species.options.other');
        const finalSpeciesKey = isOtherSpecies ? otherSpecies.trim().toLowerCase() : species;

        if (!characterName.trim() || !finalSpeciesKey || !gender || !age.trim()) {
            toast({ variant: 'destructive', title: 'Campos incompletos', description: t('errors.incompleteFields') });
            return;
        }
        if (selectedFiles.length < 2 || selectedFiles.length > 4) {
            toast({ variant: 'destructive', title: 'Fotos insuficientes', description: t('errors.insufficientPhotos') });
            return;
        }
        
        // --- Credit Check ---
        const planLimits = userProfile.stripeRole ? getPlanLimits(userProfile.stripeRole) : 0;
        const monthlyCreditsUsed = userProfile.monthlyCreditCount || 0;
        const availableMonthlyCredits = planLimits - monthlyCreditsUsed;
        const payAsYouGoCredits = userProfile.payAsYouGoCredits || 0;
        const totalAvailableCredits = availableMonthlyCredits + payAsYouGoCredits;
        
        if (totalAvailableCredits < AVATAR_CREDIT_COST) {
            toast({
                variant: 'destructive',
                title: t('errors.insufficientCreditsTitle'),
                description: t('errors.insufficientCredits', { cost: AVATAR_CREDIT_COST, available: totalAvailableCredits }),
            });
            return;
        }
        // --- End Credit Check ---

        setIsLoading(true);
        setGeneratedAvatar(null);
        setGenerationModalOpen(true);

        try {
             // --- Transaction to update credit count ---
            const userRef = userDocRef(firestore, user.uid);
            await runTransaction(firestore, async (transaction) => {
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists()) {
                    throw "El documento del usuario no existe.";
                }
                
                const currentProfile = userDoc.data() as UserProfile;
                const currentMonthlyUsed = currentProfile.monthlyCreditCount || 0;
                const currentPayAsYouGo = currentProfile.payAsYouGoCredits || 0;
                const availableMonthly = (getPlanLimits(currentProfile.stripeRole || '') - currentMonthlyUsed);

                let monthlyDebit = 0;
                let paygDebit = 0;
                
                if (availableMonthly > 0) {
                    monthlyDebit = Math.min(AVATAR_CREDIT_COST, availableMonthly);
                }

                const remainingCost = AVATAR_CREDIT_COST - monthlyDebit;

                if (remainingCost > 0) {
                     paygDebit = Math.min(remainingCost, currentPayAsYouGo);
                }

                transaction.update(userRef, { 
                    monthlyCreditCount: currentMonthlyUsed + monthlyDebit,
                    payAsYouGoCredits: currentPayAsYouGo - paygDebit,
                });
            });
            // --- End Transaction ---
            
            const formData = new FormData();
            formData.append('characterName', characterName.trim());
            const speciesValue = isOtherSpecies ? otherSpecies.trim() : (speciesTranslations[finalSpeciesKey as keyof typeof speciesTranslations]?.es || finalSpeciesKey);
            formData.append('species', speciesValue);
            formData.append('gender', genderTranslations[gender as keyof typeof genderTranslations]?.es || gender);
            formData.append('age', age.trim());
            selectedFiles.forEach((file) => {
                formData.append('images', file);
            });
            
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
                throw new Error(t('errors.noAvatarUrl'));
            }
            
            // Prepare multilingual data for Firestore
            const speciesData = isOtherSpecies 
                ? { es: otherSpecies.trim(), en: otherSpecies.trim(), it: otherSpecies.trim(), fr: otherSpecies.trim(), de: otherSpecies.trim(), pt: otherSpecies.trim() }
                : speciesTranslations[finalSpeciesKey as keyof typeof speciesTranslations];

            const genderData = genderTranslations[gender as keyof typeof genderTranslations];

            // Guardar en Firestore
            const charactersColRef = userCharactersCollectionRef(firestore, user.uid);
            addDocumentNonBlocking(charactersColRef, {
                name: characterName.trim(),
                avatarUrl: result.avatarUrl,
                species: speciesData,
                gender: genderData,
                age: Number(age.trim()),
                createdAt: serverTimestamp()
            });
            
            setGeneratedAvatar({ name: characterName, url: result.avatarUrl });
            
            toast({
                title: t('success.avatarGenerated'),
                description: t('success.avatarSaved', { name: characterName.trim() }),
            });
            

        } catch (error) {
            console.error('Error al llamar al webhook, actualizar créditos o guardar en Firestore:', error);
            const errorMessage = error instanceof Error ? error.message : t('errors.serverError');
            toast({
                variant: 'destructive',
                title: 'Error al generar el avatar',
                description: errorMessage,
            });
             // Rollback credit count if webhook fails
            const userRef = userDocRef(firestore, user.uid);
            await runTransaction(firestore, async (transaction) => {
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists()) {
                    return; // Can't rollback if doc doesn't exist
                }
                const currentProfile = userDoc.data() as UserProfile;
                const currentMonthlyUsed = currentProfile.monthlyCreditCount || 0;
                const currentPayAsYouGo = currentProfile.payAsYouGoCredits || 0;
                const availableMonthly = (getPlanLimits(currentProfile.stripeRole || '') - currentMonthlyUsed);

                let monthlyDebit = 0;
                if (availableMonthly > 0) {
                    monthlyDebit = Math.min(AVATAR_CREDIT_COST, availableMonthly);
                }
                const remainingCost = AVATAR_CREDIT_COST - monthlyDebit;
                let paygDebit = 0;
                if (remainingCost > 0) {
                     paygDebit = Math.min(remainingCost, currentPayAsYouGo);
                }

                transaction.update(userRef, { 
                    monthlyCreditCount: currentMonthlyUsed - monthlyDebit,
                    payAsYouGoCredits: currentPayAsYouGo + paygDebit,
                });
            });
            setGenerationModalOpen(false); // Close modal on error
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
            title={t('authPopup.title')}
            description={t('authPopup.description')}
            actionText={t('authPopup.actionText')}
            redirectPath="/registro"
        />

        <Dialog open={isGenerationModalOpen} onOpenChange={(open) => {
            if (!open) {
                setGenerationModalOpen(false);
                if(generatedAvatar) {
                    resetForm();
                }
            }
        }}>
            <DialogContent className="sm:max-w-md text-center">
                <DialogHeader>
                    <DialogTitle className="font-headline text-3xl">
                        {isLoading ? t('generationModal.loadingTitle') : t('generationModal.readyTitle')}
                    </DialogTitle>
                     <DialogDescription>
                        {isLoading ? t('generationModal.loadingDescription') : t('generationModal.readyDescription', { name: generatedAvatar?.name })}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-center p-8 min-h-[250px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-4 text-primary">
                            <Wand className="h-16 w-16 animate-pulse" />
                            <p className="font-semibold text-lg">{t('generationModal.generating')}</p>
                        </div>
                    ) : generatedAvatar ? (
                        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                            <Card className="overflow-hidden shadow-lg border-2 border-primary">
                                <Image 
                                    src={generatedAvatar.url}
                                    alt={`Avatar para ${generatedAvatar.name}`}
                                    width={400}
                                    height={400}
                                    className="w-full h-auto object-cover"
                                />
                            </Card>
                            <h3 className="text-xl font-bold">{generatedAvatar.name}</h3>
                        </div>
                    ) : null}
                </div>
                {!isLoading && (
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button">{t('generationModal.close')}</Button>
                        </DialogClose>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>


        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl text-gray-800">
            {t('page.title')}
          </h1>
          <p className="max-w-xl mx-auto text-primary mt-4 font-body">
             {t('page.description')}
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
                <CardTitle className="text-2xl font-semibold">{t('characterData.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div className="space-y-2">
                        <Label htmlFor="avatar-name">{t('characterData.name.label')}</Label>
                        <Input 
                            id="avatar-name" 
                            placeholder={t('characterData.name.placeholder')}
                            value={characterName}
                            onChange={(e) => setCharacterName(e.target.value)}
                            required
                            maxLength={50}
                        />
                         <div className="text-xs text-right text-muted-foreground">{characterName.length}/50</div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="species">{t('characterData.species.label')}</Label>
                         <Select value={species} onValueChange={setSpecies} required>
                            <SelectTrigger id="species">
                                <SelectValue placeholder={t('characterData.species.placeholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="human">{t('characterData.species.options.human')}</SelectItem>
                                <SelectItem value="dog">{t('characterData.species.options.dog')}</SelectItem>
                                <SelectItem value="cat">{t('characterData.species.options.cat')}</SelectItem>
                                <SelectItem value="bird">{t('characterData.species.options.bird')}</SelectItem>
                                <SelectItem value="rabbit">{t('characterData.species.options.rabbit')}</SelectItem>
                                <SelectItem value="hamster">{t('characterData.species.options.hamster')}</SelectItem>
                                <SelectItem value="fish">{t('characterData.species.options.fish')}</SelectItem>
                                <SelectItem value={t('characterData.species.options.other')}>{t('characterData.species.options.other')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {species === t('characterData.species.options.other') && (
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="other-species">{t('characterData.species.other.label')}</Label>
                            <Input
                                id="other-species"
                                placeholder={t('characterData.species.other.placeholder')}
                                value={otherSpecies}
                                onChange={(e) => setOtherSpecies(e.target.value)}
                                required
                                maxLength={50}
                            />
                            <div className="text-xs text-right text-muted-foreground">{otherSpecies.length}/50</div>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="gender">{t('characterData.gender.label')}</Label>
                         <Select value={gender} onValueChange={setGender} required>
                            <SelectTrigger id="gender">
                                <SelectValue placeholder={t('characterData.gender.placeholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">{t('characterData.gender.options.male')}</SelectItem>
                                <SelectItem value="female">{t('characterData.gender.options.female')}</SelectItem>
                                <SelectItem value="neutral">{t('characterData.gender.options.neutral')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="age">{t('characterData.age.label')}</Label>
                        <Input
                            id="age"
                            type="number"
                            placeholder={t('characterData.age.placeholder')}
                            value={age}
                            onChange={(e) => {
                                if (e.target.value.length <= 2) {
                                    setAge(e.target.value);
                                }
                            }}
                            required
                        />
                         <div className="text-xs text-right text-muted-foreground">{age.length}/2</div>
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
                <CardTitle className="text-2xl font-semibold">{t('photos.title', { count: selectedFiles.length })}</CardTitle>
                 <CardDescription className="text-sm font-semibold text-center text-destructive">
                    {t('photos.description')}
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
                                <span className="font-semibold">{t('photos.dropzone.click')}</span> {t('photos.dropzone.drag')}
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
                        <Label>{t('photos.selected')}</Label>
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
                                        <span className="sr-only">{t('photos.remove')}</span>
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
                      {t('cost.total', { cost: AVATAR_CREDIT_COST })}
                  </span>
              </Card>
              <Button type="submit" size="lg" className="shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/50 hover:-translate-y-0.5" disabled={isLoading}>
                  {isLoading ? (
                      <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {t('submitButton.loading')}
                      </>
                  ) : (
                      <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          {t('submitButton.default')}
                      </>
                  )}
              </Button>
            </div>
        </form>
    </div>
  );
}