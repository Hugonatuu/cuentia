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
import { useTranslations } from 'next-intl';

interface CreditsInfoDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreditsInfoDialog({
  isOpen,
  onOpenChange,
}: CreditsInfoDialogProps) {
  const t = useTranslations('CreditsInfoDialog');

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('title')}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-left pt-2 space-y-2 text-foreground">
                <p>
                    {t('description1')}
                </p>
                <p>
                    {t('description2')}
                </p>
                <p>
                    {t('description3')}
                </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>{t('actionButton')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}