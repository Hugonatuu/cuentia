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
): Promise<void> {
  const checkoutSessionsRef = customerCheckoutSessionsCollectionRef(db, userId);

  const sessionData: { 
    price: string; 
    mode: CheckoutMode;
    success_url: string; 
    cancel_url: string;
    quantity?: number;
    line_items?: {price: string, quantity: number}[];
  } = {
    price: priceId,
    mode: mode,
    success_url: window.location.origin + '/perfil',
    cancel_url: window.location.origin + '/precios',
  };

  if (mode === 'payment') {
    delete sessionData.price;
    sessionData.line_items = [{price: priceId, quantity}];
  }

  // 1. Create a new checkout session document in Firestore.
  const docRef = await addDoc(checkoutSessionsRef, sessionData);

  // 2. Wait for the CheckoutSession to get a URL from the Stripe extension.
  onSnapshot(docRef, (snap) => {
    const data = snap.data();
    if (data) {
      const { error, url } = data;

      if (error) {
        // Show an error to your customer and inspect your Cloud Function logs in the Firebase console.
        console.error(`An error occurred: ${error.message}`);
        alert(`An error occurred: ${error.message}`); // Consider using a toast notification
        return;
      }

      if (url) {
        // We have a URL, let's redirect to Checkout.
        window.location.assign(url);
      }
    }
  });
}
