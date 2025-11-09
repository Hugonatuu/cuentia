'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { userCharactersCollectionRef, predefinedCharactersCollectionRef } from '@/firebase/firestore/references';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import {useRouter} from '@/i18n/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { Character, PredefinedCharacter, AnyCharacter } from '@/app/[locale]/cuentos/crear/components/types';

interface ProfileAvatarPickerDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelectAvatar: (character: AnyCharacter) => void;
}

const CharacterCard = ({ character, onSelect }: { character: AnyCharacter; onSelect: () => void; }) => (
  <Card
    className="overflow-hidden group transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1"
    onClick={onSelect}
  >
    <CardContent className="p-0 text-center relative aspect-square">
        <Image
          src={'avatarUrl' in character ? character.avatarUrl : character.imageUrl}
          alt={character.name}
          fill
          className="object-cover object-center transition-transform duration-300 group-hover:scale-110"
        />
      <div className="absolute bottom-0 w-full p-2 bg-black/50 backdrop-blur-sm">
        <h3 className="font-semibold text-md truncate text-white">{character.name}</h3>
      </div>
    </CardContent>
  </Card>
);

const CharacterList = ({ characters, onSelect, isLoading, type }: { characters: AnyCharacter[] | null; onSelect: (char: AnyCharacter) => void; isLoading: boolean; type: 'user' | 'predefined' }) => {
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
        />
      ))}
    </div>
  );
};

export function ProfileAvatarPickerDialog({ isOpen, onOpenChange, onSelectAvatar }: ProfileAvatarPickerDialogProps) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Elige tu Foto de Perfil</DialogTitle>
          <DialogDescription>
            Selecciona uno de tus personajes creados o uno de nuestros personajes predefinidos como tu avatar.
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
                Crear Personaje
            </Button>
          </div>
          
          <ScrollArea className="flex-grow mt-4 pr-4">
            <TabsContent value="my-characters">
              <CharacterList
                characters={userCharacters}
                onSelect={onSelectAvatar}
                isLoading={isUserCharsLoading}
                type="user"
              />
            </TabsContent>
            <TabsContent value="predefined">
              <CharacterList
                characters={predefinedCharacters}
                onSelect={onSelectAvatar}
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
