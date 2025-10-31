'use client';

import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  Firestore,
} from 'firebase/firestore';
import { loadStripe } from '@stripe/stripe-js';

export async function createCheckoutSession(
  db: Firestore,
  userId: string,
  priceId: string
) {
  const checkoutSessionsRef = collection(db, 'users', userId, 'checkout_sessions');

  const docRef = await addDoc(checkoutSessionsRef, {
    price: priceId,
    success_url: window.location.origin,
    cancel_url: window.location.origin,
  });

  onSnapshot(docRef, async (snap) => {
    const { error, url } = snap.data() || {};
    if (error) {
      console.error(`An error occurred: ${error.message}`);
      // Optionally, show a toast to the user
    }
    if (url) {
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
      );
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId: snap.id });
      }
    }
  });
}
