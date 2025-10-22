'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { AnyCharacter } from './types';

interface CharacterCustomizationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  character: AnyCharacter;
  initialCustomization: string;
  onSave: (customization: string) => void;
}

export function CharacterCustomizationDialog({
  isOpen,
  onOpenChange,
  character,
  initialCustomization,
  onSave,
}: CharacterCustomizationDialogProps) {
  const [customization, setCustomization] = useState(initialCustomization);

  const handleSave = () => {
    onSave(customization);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Personalizar a {character.name}</DialogTitle>
          <DialogDescription>
            Añade detalles visuales específicos para este personaje solo para este cuento.
            <br />
            <span className="font-semibold text-primary">(+100cd por personalización)</span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 items-start gap-4 py-4">
          <div className="relative aspect-square col-span-1">
            <Image
              src={'avatarUrl' in character ? character.avatarUrl : character.imageUrl}
              alt={character.name}
              fill
              className="rounded-md object-cover"
            />
          </div>
          <div className="col-span-3 grid w-full gap-1.5">
            <Label htmlFor="customization">Cambios para este cuento</Label>
            <Textarea
              id="customization"
              placeholder="Ej: Quiero que en este libro Hugo lleve ropa de abrigo y una gorra azul."
              value={customization}
              onChange={(e) => setCustomization(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave}>
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
