import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import WelcomePopup from '@/components/core/WelcomePopup';
import { WelcomePopupProvider } from '@/hooks/use-welcome-popup';
import {notFound} from 'next/navigation';
import {Locale, hasLocale, NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import CookieBanner from './components/core/CookieBanner';

type LayoutProps = {
  children: React.ReactNode;
  params: { locale: string };
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}
export const metadata: Metadata = {
  title: 'Cuentia',
  description: 'Crea cuentos infantiles personalizados con IA.',
};

export default async function LocaleLayout({
  children,
  params
}: LayoutProps) {
   // Ensure that the incoming `locale` is valid
   const {locale} = params;
   if (!hasLocale(routing.locales, locale as Locale)) {
     notFound();
   }
 
   // Enable static rendering
   setRequestLocale(locale);
   const messages = await getMessages();
 
  return (
    <html lang={locale} className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Luckiest+Guy&family=Open+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
      <NextIntlClientProvider locale={locale} messages={messages}>
        <FirebaseClientProvider>
          <WelcomePopupProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
            <WelcomePopup />
            <Toaster />
            <CookieBanner />
          </WelcomePopupProvider>
        </FirebaseClientProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
