'use client';
import { useTranslations } from 'next-intl';

export default function LegalPage() {
  const t = useTranslations('LegalPage');
  return (
    <div className="container mx-auto max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: t.raw('content') }}
      />
    </div>
  );
}
