'use client';

import { addDoc, onSnapshot, Firestore } from 'firebase/firestore';
import { customerCheckoutSessionsCollectionRef } from '@/firebase/firestore/references';

export async function createCheckoutSession(
  db: Firestore,
  userId: string,
  priceId: string
): Promise<void> {
  const checkoutSessionsRef = customerCheckoutSessionsCollectionRef(db, userId);

  // 1. Create a new checkout session document in Firestore.
  const docRef = await addDoc(checkoutSessionsRef, {
    price: priceId,
    mode: 'subscription', // Specify subscription mode
    success_url: window.location.origin + '/perfil',
    cancel_url: window.location.origin + '/precios',
  });

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
