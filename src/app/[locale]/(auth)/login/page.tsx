'use client';

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
import { useAuth, useUser } from '@/firebase';
import { initiateEmailSignIn, initiateGoogleSignIn } from '@/firebase/non-blocking-login';
import { useEffect, useState } from 'react';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { useToast } from '@/hooks/use-toast';
import { User } from 'firebase/auth';
import { Link, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('LoginPage');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = useAuth();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user && user.emailVerified) {
      router.push('/perfil');
    }
  }, [user, isUserLoading, router]);

  const handleSuccess = (loggedInUser: User) => {
    if (!loggedInUser.emailVerified) {
      toast({
        variant: 'destructive',
        title: t('verificationRequiredTitle'),
        description: t('verificationRequiredDescription'),
      });
      auth.signOut();
    } else {
      router.push('/perfil');
    }
  };

  const handleError = (error: any) => {
    toast({
      variant: 'destructive',
      title: t('loginErrorTitle'),
      description: t('loginErrorDescription'),
    });
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth) return;
    initiateEmailSignIn(auth, email, password, handleSuccess, handleError);
  };

  const handleGoogleSignIn = () => {
    if (!auth) return;
    initiateGoogleSignIn(auth);
  };

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">{t('emailLabel')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">{t('passwordLabel')}</Label>
                  <Link
                    href="/restablecer-contrasena"
                    className="ml-auto inline-block text-sm underline"
                  >
                    {t('forgotPassword')}
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                {t('submitButton')}
              </Button>
            </div>
          </form>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={handleGoogleSignIn}
          >
            <GoogleIcon className="mr-2 h-4 w-4" />
            {t('googleButton')}
          </Button>
          <div className="mt-4 text-center text-sm">
            {t('noAccountText')}{' '}
            <Link href="/registro" className="underline">
              {t('registerLink')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}