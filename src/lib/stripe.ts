'use client';

import { addDoc, onSnapshot, Firestore } from 'firebase/firestore';
import { customerCheckoutSessionsCollectionRef } from '@/firebase/firestore/references';
import { loadStripe } from '@stripe/stripe-js';

export async function createCheckoutSession(
  db: Firestore,
  userId: string,
  priceId: string
): Promise<void> {
  const checkoutSessionsRef = customerCheckoutSessionsCollectionRef(db, userId);

  // 1. Create a new checkout session document in Firestore.
  const docRef = await addDoc(checkoutSessionsRef, {
    price: priceId,
    success_url: window.location.origin + '/perfil',
    cancel_url: window.location.origin + '/precios',
  });

  // 2. Wait for the CheckoutSession to get a session ID from the Stripe extension.
  onSnapshot(docRef, async (snap) => {
    const { error, sessionId } = snap.data() || {};

    if (error) {
      // Show an error to your customer and inspect your Cloud Function logs in the Firebase console.
      console.error(`An error occurred: ${error.message}`);
      alert(`An error occurred: ${error.message}`); // Consider using a toast notification
      return;
    }

    if (sessionId) {
      // We have a session, let's redirect to Checkout.
      const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!publishableKey) {
        throw new Error('Stripe publishable key not found.');
      }

      const stripe = await loadStripe(publishableKey);
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    }
  });
}
