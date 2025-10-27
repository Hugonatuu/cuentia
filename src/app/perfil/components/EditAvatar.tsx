'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { User, updateProfile } from 'firebase/auth';
import { useFirestore } from '@/firebase';
import { userDocRef } from '@/firebase/firestore/references';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Camera, Loader2, UploadCloud, X } from 'lucide-react';
import Image from 'next/image';

interface EditAvatarProps {
  user: User;
}

export default function EditAvatar({ user }: EditAvatarProps) {
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      const file = acceptedFiles[0];
      setNewAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg'] },
    multiple: false,
  });

  const handleUpload = async () => {
    if (!newAvatarFile) return;

    setIsUploading(true);
    try {
      // NOTE: Replace this with your actual file upload logic (e.g., to a webhook or Firebase Storage)
      const formData = new FormData();
      formData.append('avatar', newAvatarFile);

      // SIMULATING A WEBHOOK UPLOAD
      const response = await new Promise<{ url: string }>((resolve) => {
        setTimeout(() => {
          resolve({ url: preview! }); // Use preview for simulation
        }, 1500);
      });
      // In a real scenario, the response would be from your server:
      // const uploadResponse = await fetch('YOUR_UPLOAD_WEBHOOK', { method: 'POST', body: formData });
      // const response = await uploadResponse.json();

      const newPhotoURL = response.url;

      // Update Firebase Auth profile
      await updateProfile(user, { photoURL: newPhotoURL });

      // Update Firestore document
      const userRef = userDocRef(firestore, user.uid);
      updateDocumentNonBlocking(userRef, { photoURL: newPhotoURL });

      toast({
        title: '¡Avatar actualizado!',
        description: 'Tu foto de perfil se ha cambiado correctamente.',
      });

      // Cleanup
      setNewAvatarFile(null);
      setPreview(null);
      if (preview) URL.revokeObjectURL(preview);

    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        variant: 'destructive',
        title: 'Error al subir',
        description: 'No se pudo cambiar tu foto de perfil. Por favor, inténtalo de nuevo.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    if (preview) {
        URL.revokeObjectURL(preview);
    }
    setNewAvatarFile(null);
    setPreview(null);
  }

  return (
    <div className="relative group mb-4">
      {preview ? (
        <div className="flex flex-col items-center gap-4">
            <Image src={preview} alt="Vista previa del nuevo avatar" width={96} height={96} className="h-24 w-24 rounded-full object-cover" />
            <div className="flex gap-2">
                <Button onClick={handleUpload} disabled={isUploading}>
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UploadCloud className="h-4 w-4 mr-2" />}
                    Guardar
                </Button>
                <Button variant="ghost" size="icon" onClick={handleCancel} disabled={isUploading}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
      ) : (
        <div {...getRootProps()} className="cursor-pointer">
          <input {...getInputProps()} />
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
            <Camera className="h-8 w-8 text-white" />
          </div>
        </div>
      )}
    </div>
  );
}
