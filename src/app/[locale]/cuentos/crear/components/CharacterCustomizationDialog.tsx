
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTranslations } from 'next-intl';

interface CharacterCustomizationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  character: AnyCharacter;
  initialVisualDescription: string;
  onSave: (visual_description: string) => void;
}

export function CharacterCustomizationDialog({
  isOpen,
  onOpenChange,
  character,
  initialVisualDescription,
  onSave,
}: CharacterCustomizationDialogProps) {
  const t = useTranslations('CharacterCustomizationDialog');
  const [visualDescription, setVisualDescription] = useState(initialVisualDescription);
  const maxLength = 400;

  const handleSave = () => {
    onSave(visualDescription);
    onOpenChange(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const sanitizedValue = e.target.value.replace(/(\r\n|\n|\r)/gm, "");
    if (sanitizedValue.length <= maxLength) {
      setVisualDescription(sanitizedValue);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title', { characterName: character.name })}</DialogTitle>
          <DialogDescription>
            {t('description')}
            <br />
            <span className="font-semibold text-primary">(+150cd por personalización)</span>
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
            <Label htmlFor="visual_description">{t('changes')}</Label>
            <Textarea
              id="visual_description"
              placeholder={t('placeholder')}
              value={visualDescription}
              onChange={handleChange}
              className="min-h-[100px]"
              maxLength={maxLength}
            />
             <div className="text-xs text-right text-muted-foreground">
              {visualDescription.length}/{maxLength}
            </div>
          </div>
        </div>
        <Alert variant="destructive" className="text-foreground">
          <AlertDescription>
            {t('alert')}
          </AlertDescription>
        </Alert>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button type="button" onClick={handleSave}>
            {t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
