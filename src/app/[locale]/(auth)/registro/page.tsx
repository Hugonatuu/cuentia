'use client';

import { useEffect, useState } from 'react';
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
import { Link, useRouter } from '@/i18n/navigation';
import { useAuth, useUser } from '@/firebase';
import {
  initiateEmailSignUp,
  initiateGoogleSignIn,
} from '@/firebase/non-blocking-login';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
  const t = useTranslations('RegisterPage');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const auth = useAuth();
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && user && user.emailVerified) {
      router.push('/perfil');
    }
  }, [user, isUserLoading, router]);

  const handleSignUp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth) return;
    initiateEmailSignUp(auth, email, password, firstName, () => {
      router.push('/verificar-correo');
    });
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
          <form onSubmit={handleSignUp}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">{t('firstNameLabel')}</Label>
                <Input
                  id="first-name"
                  placeholder={t('firstNamePlaceholder')}
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
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
                <Label htmlFor="password">{t('passwordLabel')}</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
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
            {t('loginText')}{' '}
            <Link href="/login" className="underline">
              {t('loginLink')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}