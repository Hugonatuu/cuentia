'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CreditsInfoDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreditsInfoDialog({
  isOpen,
  onOpenChange,
}: CreditsInfoDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Cómo funcionan los créditos?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-left pt-2 space-y-2">
                <p>
                    Cada vez que creas un cuento, tus créditos se usan según el tipo de creación que elijas.
                </p>
                <p>
                    Los cuentos más básicos cuestan desde 400 créditos, e incluyen texto + ilustraciones personalizadas.
                </p>
                <p>
                    Cuantos más elementos añadas (más páginas, más imágenes o voz narrada), más créditos necesitarás.
                </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Entendido</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
