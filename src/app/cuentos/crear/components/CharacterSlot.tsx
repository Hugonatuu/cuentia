'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { CharacterPickerDialog } from './CharacterPickerDialog';
import type { AnyCharacter } from './types';

interface CharacterSlotProps {
  character: AnyCharacter | undefined;
  allSelectedCharacters: AnyCharacter[];
  onSelect: (character: AnyCharacter) => void;
  onRemove: () => void;
}

export function CharacterSlot({ character, allSelectedCharacters, onSelect, onRemove }: CharacterSlotProps) {
  const [isPickerOpen, setPickerOpen] = useState(false);

  const excludedIds = allSelectedCharacters.filter(Boolean).map(c => c.id);

  if (character) {
    return (
      <div className="relative group aspect-square">
        <Card className="overflow-hidden w-full h-full">
          <Image
            src={'avatarUrl' in character ? character.avatarUrl : character.imageUrl}
            alt={character.name}
            width={200}
            height={200}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 w-full p-2 bg-black/50 backdrop-blur-sm text-center">
             <p className="text-white text-sm font-semibold truncate">{character.name}</p>
          </div>
        </Card>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute -top-2 -right-2 h-7 w-7 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <Card
        className="aspect-square flex items-center justify-center border-2 border-dashed bg-muted/50 hover:bg-muted/80 hover:border-primary transition-colors cursor-pointer"
        onClick={() => setPickerOpen(true)}
      >
        <CardContent className="p-0 flex flex-col items-center justify-center text-muted-foreground">
          <Plus className="h-10 w-10" />
          <p className="mt-2 text-sm font-medium">Añadir</p>
        </CardContent>
      </Card>

      <CharacterPickerDialog
        isOpen={isPickerOpen}
        onOpenChange={setPickerOpen}
        onSelectCharacter={onSelect}
        excludedIds={excludedIds}
      />
    </>
  );
}
