
'use client';

import { addDoc, onSnapshot, Firestore } from 'firebase/firestore';
import { customerCheckoutSessionsCollectionRef } from '@/firebase/firestore/references';

type CheckoutMode = 'payment' | 'subscription';

export async function createCheckoutSession(
  db: Firestore,
  userId: string,
  priceId: string,
  mode: CheckoutMode,
  quantity: number = 1,
  locale: string
): Promise<void> {
  const checkoutSessionsRef = customerCheckoutSessionsCollectionRef(db, userId);

  const sessionData: { 
    price?: string; 
    mode: CheckoutMode;
    success_url: string; 
    cancel_url: string;
    line_items?: {price: string, quantity: number}[];
    automatic_tax: { enabled: boolean };
    invoice_creation: { enabled: boolean };
  } = {
    mode: mode,
    success_url: window.location.origin + `/${locale}/pago-exitoso`,
    cancel_url: window.location.origin + `/${locale}/precios`,
    automatic_tax: { enabled: true },
    invoice_creation: { enabled: true },
  };

  if (mode === 'payment') {
    sessionData.line_items = [{price: priceId, quantity}];
  } else {
    sessionData.price = priceId;
  }

  const docRef = await addDoc(checkoutSessionsRef, sessionData);

  onSnapshot(docRef, (snap) => {
    const data = snap.data();
    if (data) {
      const { error, url } = data;

      if (error) {
        console.error(`An error occurred: ${error.message}`);
        alert(`An error occurred: ${error.message}`);
        return;
      }

      if (url) {
        window.location.assign(url);
      }
    }
  });
}
