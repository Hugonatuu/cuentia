'use client';

import { useState } from 'react';
import { useAuth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const { toast } = useToast();

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth || !email) return;

    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: 'Correo enviado',
        description: 'Revisa tu bandeja de entrada para restablecer tu contraseña.',
      });
      setEmail('');
    } catch (error: any) {
      console.error("Error al enviar el correo de restablecimiento:", error);
      let description = 'Ocurrió un error. Por favor, inténtalo de nuevo.';
      if (error.code === 'auth/user-not-found') {
        description = 'No se encontró ninguna cuenta con ese correo electrónico.';
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Restablecer Contraseña
          </CardTitle>
          <CardDescription>
            Introduce tu correo electrónico y te enviaremos un enlace para
            restablecer tu contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordReset}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@ejemplo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar enlace
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            ¿Recuerdas tu contraseña?{' '}
            <Link href="/login" className="underline">
              Inicia sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
