
'use client';
import { useTranslations } from 'next-intl';

export default function TermsAndConditionsPage() {
  const t = useTranslations('TermsPage');
  return (
    <div className="container mx-auto max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
      <div className="whitespace-pre-wrap">
          {t('content')}
      </div>
    </div>
  );
}

    