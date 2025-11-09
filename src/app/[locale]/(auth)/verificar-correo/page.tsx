'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MailCheck } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function VerifyEmailPage() {
  const t = useTranslations('VerifyEmailPage');

  return (
    <div className="flex items-center justify-center py-24">
      <Card className="mx-auto max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold">
            {t('title')}
          </CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            {t('afterVerification')}
          </p>
          <Button asChild>
            <Link href="/login">{t('loginButton')}</Link>
          </Button>
          <p className="mt-6 text-xs text-muted-foreground">
            {t('noEmailText')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}