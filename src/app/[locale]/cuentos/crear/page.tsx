
'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function CrearCuentoRedirectPage() {
  useEffect(() => {
    redirect('/cuentos/crear/aprendizaje');
  }, []);

  // Return a loading state or null while redirecting
  return null;
}
