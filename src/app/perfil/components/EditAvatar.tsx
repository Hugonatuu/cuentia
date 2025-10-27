'use client';

import { useState } from 'react';
import { User, updateProfile } from 'firebase/auth';
import { useFirestore } from '@/firebase';
import { userDocRef } from '@/firebase/firestore/references';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Camera, Loader2 } from 'lucide-react';
import { ProfileAvatarPickerDialog } from './ProfileAvatarPickerDialog'; // Changed import
import type { AnyCharacter } from '@/app/cuentos/crear/components/types';

interface EditAvatarProps {
  user: User;
}

export default function EditAvatar({ user }: EditAvatarProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPickerDialogOpen, setIsPickerDialogOpen] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSelectAvatar = async (character: AnyCharacter) => {
    if (!firestore) return;

    const newPhotoURL = 'avatarUrl' in character ? character.avatarUrl : character.imageUrl;

    if (newPhotoURL === user.photoURL) {
      setIsPickerDialogOpen(false);
      return;
    }

    setIsUpdating(true);
    setIsPickerDialogOpen(false);

    try {
      // Update Firebase Auth profile
      await updateProfile(user, { photoURL: newPhotoURL });

      // Update Firestore document
      const userRef = userDocRef(firestore, user.uid);
      updateDocumentNonBlocking(userRef, { photoURL: newPhotoURL });

      toast({
        title: '¡Avatar actualizado!',
        description: 'Tu foto de perfil se ha cambiado correctamente.',
      });
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast({
        variant: 'destructive',
        title: 'Error al actualizar',
        description: 'No se pudo cambiar tu foto de perfil. Por favor, inténtalo de nuevo.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="relative group mb-4">
        <div 
          className="cursor-pointer"
          onClick={() => !isUpdating && setIsPickerDialogOpen(true)}
        >
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={user.photoURL || `https://avatar.vercel.sh/${user.uid}.png`}
              alt={user.displayName || 'Avatar'}
            />
            <AvatarFallback>
              {user.displayName
                ? user.displayName.charAt(0)
                : user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {isUpdating ? (
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            ) : (
              <Camera className="h-8 w-8 text-white" />
            )}
          </div>
        </div>
      </div>
      <ProfileAvatarPickerDialog
        isOpen={isPickerDialogOpen}
        onOpenChange={setIsPickerDialogOpen}
        onSelectAvatar={handleSelectAvatar}
      />
    </>
  );
}
