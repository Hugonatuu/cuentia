"use client"

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { characterSubNav } from "@/lib/placeholder-data";
import { cn } from "@/lib/utils";

export default function CharactersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="container py-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl text-gray-800">
          Un Mundo de Personajes
        </h1>
        <p className="text-center text-lg text-muted-foreground mt-4 mb-8 max-w-2xl mx-auto">
          Elige entre nuestros personajes listos para la aventura o crea los tuyos propios subiendo una foto. ¡La magia está en tus manos!
        </p>
      </div>
      
      <div className="flex justify-center mb-8">
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
          {characterSubNav.map((link) => (
            <Link
              href={link.href}
              key={link.href}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                pathname === link.href ? "bg-background text-foreground shadow-sm" : "hover:bg-background/50"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {children}
    </div>
  );
}
