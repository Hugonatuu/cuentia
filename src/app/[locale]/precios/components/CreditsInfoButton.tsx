
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { CreditsInfoDialog } from '@/app/[locale]/perfil/components/CreditsInfoDialog';

export default function CreditsInfoButton() {
  const t = useTranslations('PreciosPage');
  const [isCreditsInfoOpen, setIsCreditsInfoOpen] = useState(false);

  return (
    <>
      <CreditsInfoDialog
        isOpen={isCreditsInfoOpen}
        onOpenChange={setIsCreditsInfoOpen}
      />
      <Button variant="outline" onClick={() => setIsCreditsInfoOpen(true)}>
        <Info className="mr-2 h-4 w-4" />
        {t('creditsInfoButton')}
      </Button>
    </>
  );
}
