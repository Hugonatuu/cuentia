'use client';
import { Link } from '@/i18n/navigation';
import Logo from '@/components/core/Logo';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

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
            <Image 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/600px-Instagram_icon.png"
                alt="Instagram Logo"
                width={24}
                height={24}
                className="transition-opacity hover:opacity-80"
            />
          </a>
          <a href="https://www.tiktok.com/@cuentia.app?_r=1&_t=ZN-93lx96ynW5e" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
             <Image 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Tiktok_icon.svg/640px-Tiktok_icon.svg.png"
                alt="TikTok Logo"
                width={24}
                height={24}
                className="transition-opacity hover:opacity-80"
            />
          </a>
          <a href="https://www.facebook.com/share/1AsNNjN9ag/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
             <Image 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Facebook_f_logo_%282019%29.svg/600px-Facebook_f_logo_%282019%29.svg.png"
                alt="Facebook Logo"
                width={24}
                height={24}
                className="transition-opacity hover:opacity-80"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
