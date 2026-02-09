'use client';
import { Link } from '@/i18n/navigation';
import Logo from '@/components/core/Logo';
import { useTranslations } from 'next-intl';
import { Instagram } from 'lucide-react';
import { TikTokIcon } from './icons/TikTokIcon';

export default function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex items-center justify-center md:justify-start flex-1">
          <Link href="/" className="flex items-center space-x-2">
            <Logo width={140} height={32} />
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 text-sm text-muted-foreground flex-1">
           <a href="mailto:cuentia@cuentia.net">Contacto: cuentia@cuentia.net</a>
           <Link href="/legal" className="hover:text-primary">{t('legal')}</Link>
           <Link href="/privacidad" className="hover:text-primary">{t('privacy')}</Link>
           <Link href="/terminos" className="hover:text-primary">{t('terms')}</Link>
           <Link href="/cookies" className="hover:text-primary">{t('cookies')}</Link>
        </div>

        <div className="flex items-center justify-center md:justify-end flex-1 space-x-4">
          <a href="https://www.instagram.com/cuentia.app?igsh=MWdlODU5dDVrNWk0dA%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <Instagram className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
          </a>
          <a href="https://www.tiktok.com/@cuentia.app?_r=1&_t=ZN-93lx96ynW5e" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
            <TikTokIcon className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
          </a>
        </div>
      </div>
    </footer>
  );
}
