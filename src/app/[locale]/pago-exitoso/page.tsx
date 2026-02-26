
'use client';

import { Button } from '@/app/[locale]/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/app/[locale]/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import Script from 'next/script';

export default function PagoExitosoPage() {
  const t = useTranslations('SuccessPage');

  return (
    <div className="container mx-auto py-24 flex items-center justify-center">
      {/* Event snippet for Compra conversion page */}
      <Script id="google-ads-conversion" strategy="afterInteractive">
        {`
          gtag('event', 'conversion', {
              'send_to': 'AW-17959066368/nZYRCKaapv8bEIC2xvNC',
              'value': 5.0,
              'currency': 'EUR',
              'transaction_id': ''
          });
        `}
      </Script>

      <Card className="max-w-md w-full text-center shadow-xl border-2 border-primary/20">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-headline text-gray-800">
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-muted-foreground font-body">
            {t('description')}
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild size="lg" className="w-full">
            <Link href="/perfil">
              {t('cta')}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
