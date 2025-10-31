import Link from 'next/link';
import Logo from '@/app/[locale]/components/core/Logo';

export default function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex items-center justify-center md:justify-start flex-1">
          <Link href="/" className="flex items-center space-x-2">
            <Logo width={140} height={32} />
          </Link>
        </div>
        <div className="flex items-center justify-center flex-1">
          <p className="text-center text-sm leading-loose text-muted-foreground">
            Creado con 💜 para pequeños lectores.
          </p>
        </div>
        <div className="flex items-center justify-center md:justify-end flex-1">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Cuentia. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
