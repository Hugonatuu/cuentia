'use client';

import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import Logo from '@/components/core/Logo';
import { useWelcomePopup } from '@/hooks/use-welcome-popup';

export default function WelcomePopup() {
  const { isPopupOpen, closePopup } = useWelcomePopup();

  return (
    <Dialog open={isPopupOpen} onOpenChange={closePopup}>
      <DialogContent className="sm:max-w-md text-center p-12">
        <div className="flex flex-col items-center justify-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800">Bienvenido a</h2>
            <Logo width={200} height={46} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
