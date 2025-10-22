'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { userCharactersCollectionRef, predefinedCharactersCollectionRef } from '@/firebase/firestore/references';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle } from 'lucide-react';
import type { Character, PredefinedCharacter, AnyCharacter } from './types';

interface CharacterPickerDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelectCharacter: (character: AnyCharacter) => void;
  excludedIds: string[];
}

const CharacterCard = ({ character, onSelect, isDisabled }: { character: AnyCharacter; onSelect: () => void; isDisabled: boolean }) => (
  <Card
    className={`overflow-hidden group transition-all duration-200 cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-1'}`}
    onClick={() => !isDisabled && onSelect()}
  >
    <CardContent className="p-0 text-center relative">
      <div className="aspect-square overflow-hidden">
        <Image
          src={character.avatarUrl || character.imageUrl || ''}
          alt={character.name}
          width={200}
          height={200}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <div className="py-2 px-1 absolute bottom-0 w-full bg-black/50 backdrop-blur-sm">
        <h3 className="font-semibold text-sm text-white truncate">{character.name}</h3>
      </div>
    </CardContent>
  </Card>
);

const CharacterList = ({ characters, onSelect, excludedIds, isLoading, type }: { characters: AnyCharacter[] | null; onSelect: (char: AnyCharacter) => void; excludedIds: string[]; isLoading: boolean; type: 'user' | 'predefined' }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <Skeleton className="h-5 w-3/4 mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (!characters || characters.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No hay personajes {type === 'user' ? 'creados' : 'predefinidos'}.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {characters.map((char) => (
        <CharacterCard
          key={char.id}
          character={char}
          onSelect={() => onSelect(char)}
          isDisabled={excludedIds.includes(char.id)}
        />
      ))}
    </div>
  );
};


export function CharacterPickerDialog({ isOpen, onOpenChange, onSelectCharacter, excludedIds }: CharacterPickerDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userCharactersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return userCharactersCollectionRef(firestore, user.uid);
  }, [firestore, user]);

  const predefinedCharactersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return predefinedCharactersCollectionRef(firestore);
  }, [firestore]);

  const { data: userCharacters, isLoading: isUserCharsLoading } = useCollection<Character>(userCharactersQuery);
  const { data: predefinedCharacters, isLoading: isPredefinedCharsLoading } = useCollection<PredefinedCharacter>(predefinedCharactersQuery);

  const handleSelect = (character: AnyCharacter) => {
    onSelectCharacter(character);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Elige un Personaje</DialogTitle>
          <DialogDescription>
            Selecciona un personaje para tu historia. Los personajes ya elegidos están desactivados.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="my-characters" className="flex-grow flex flex-col">
          <div className='flex justify-between items-center pr-1'>
            <TabsList>
                <TabsTrigger value="my-characters">Mis Personajes</TabsTrigger>
                <TabsTrigger value="predefined">Predefinidos</TabsTrigger>
            </TabsList>
             <Button variant="outline" size="sm" onClick={() => router.push('/crear-personaje')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear Nuevo
            </Button>
          </div>
          
          <ScrollArea className="flex-grow mt-4 pr-4">
            <TabsContent value="my-characters">
              <CharacterList
                characters={userCharacters}
                onSelect={handleSelect}
                excludedIds={excludedIds}
                isLoading={isUserCharsLoading}
                type="user"
              />
            </TabsContent>
            <TabsContent value="predefined">
              <CharacterList
                characters={predefinedCharacters}
                onSelect={handleSelect}
                excludedIds={excludedIds}
                isLoading={isPredefinedCharsLoading}
                type="predefined"
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
