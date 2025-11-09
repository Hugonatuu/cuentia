'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, updateProfile } from 'firebase/auth';
import { useFirestore } from '@/firebase';
import { userDocRef } from '@/firebase/firestore/references';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Save, X, Loader2 } from 'lucide-react';

interface EditDisplayNameProps {
  user: User;
}

const formSchema = z.object({
  displayName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.').max(50, 'El nombre no puede tener más de 50 caracteres.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditDisplayName({ user }: EditDisplayNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: user.displayName || '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (data.displayName === user.displayName) {
      setIsEditing(false);
      return;
    }

    setIsSubmitting(true);
    try {
      // Update Firebase Auth profile
      await updateProfile(user, { displayName: data.displayName });
      
      // Update Firestore document
      const userRef = userDocRef(firestore, user.uid);
      updateDocumentNonBlocking(userRef, { displayName: data.displayName });

      toast({
        title: '¡Nombre actualizado!',
        description: 'Tu nombre de perfil se ha cambiado correctamente.',
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating display name:', error);
      toast({
        variant: 'destructive',
        title: 'Error al actualizar',
        description: 'No se pudo cambiar tu nombre. Por favor, inténtalo de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2 mt-2 w-full max-w-xs">
        <div className="flex-grow">
          <Input
            {...register('displayName')}
            className="h-9"
            aria-invalid={errors.displayName ? "true" : "false"}
          />
          {errors.displayName && <p className="text-xs text-destructive mt-1">{errors.displayName.message}</p>}
        </div>
        <Button type="submit" size="icon" className="h-9 w-9" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => setIsEditing(false)}>
          <X className="h-4 w-4" />
        </Button>
      </form>
    );
  }

  return (
    <div
      className="flex items-center gap-2 text-xl font-bold cursor-pointer group"
      onClick={() => {
        setValue('displayName', user.displayName || '');
        setIsEditing(true);
      }}
    >
      <h2>{user.displayName || 'Sin nombre'}</h2>
      <Pencil className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

    