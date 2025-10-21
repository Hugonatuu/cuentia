import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo.png" alt="Cuentia Logo" width={140} height={32} key={Math.random()} />
          </Link>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Creado con ❤️ para pequeños lectores.
          </p>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Cuentia. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
