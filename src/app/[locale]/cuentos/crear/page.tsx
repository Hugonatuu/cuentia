
'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function CrearCuentoRedirectPage() {
  useEffect(() => {
    // This page is now a selector, so we don't redirect automatically.
    // The user will choose an option. We keep this page as the entry point.
  }, []);

  return null;
}
