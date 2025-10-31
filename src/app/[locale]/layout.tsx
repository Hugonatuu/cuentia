import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/app/[locale]/components/ui/toaster';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { FirebaseClientProvider } from '@/app/[locale]/firebase/client-provider';
import WelcomePopup from '@/app/[locale]/components/core/WelcomePopup';
import { WelcomePopupProvider } from '@/hooks/use-welcome-popup';

export const metadata: Metadata = {
  title: 'Cuentia',
  description: 'Crea cuentos infantiles personalizados con IA.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Luckiest+Guy&family=Open+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <WelcomePopupProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
            <WelcomePopup />
            <Toaster />
          </WelcomePopupProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
