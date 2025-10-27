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
import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <div className="flex items-center justify-center py-24">
      <Card className="mx-auto max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold">
            ¡Ya casi estás! Verifica tu correo
          </CardTitle>
          <CardDescription>
            Hemos enviado un enlace de verificación a tu correo electrónico. Por
            favor, haz clic en el enlace para activar tu cuenta y poder iniciar
            sesión.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Una vez verificado, podrás acceder a todas las funciones de
            Cuentia.
          </p>
          <Button asChild>
            <Link href="/login">Ir a Iniciar Sesión</Link>
          </Button>
          <p className="mt-6 text-xs text-muted-foreground">
            ¿No has recibido el correo? Revisa tu carpeta de spam o contacta
            con nosotros.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
