'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function CookieBanner() {
  const t = useTranslations('CookieBanner');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleReject = () => {
    // For now, rejecting also dismisses the banner as there are no non-essential cookies to disable.
    // This can be changed later if tracking/analytics cookies are added.
    localStorage.setItem('cookie-consent', 'rejected');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-t p-4 shadow-lg animate-in slide-in-from-bottom-full duration-500">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-foreground">
          {t('text')}{' '}
          <Link href="/privacidad" className="underline hover:text-primary">
            {t('privacyPolicy')}
          </Link>
          .
        </p>
        <div className="flex items-center gap-4">
          <Button onClick={handleAccept}>{t('accept')}</Button>
          <Button variant="ghost" onClick={handleReject}>
            {t('reject')}
          </Button>
        </div>
      </div>
    </div>
  );
}
