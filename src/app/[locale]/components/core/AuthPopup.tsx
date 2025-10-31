'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/[locale]/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';

interface AuthPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  actionText: string;
  redirectPath: string;
}

export default function AuthPopup({
  isOpen,
  onOpenChange,
  title,
  description,
  actionText,
  redirectPath,
}: AuthPopupProps) {
  const router = useRouter();

  const handleAction = () => {
    router.push(redirectPath);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleAction}>{actionText}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
