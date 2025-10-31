'use client';

import { addDoc, onSnapshot, Firestore } from 'firebase/firestore';
import { loadStripe } from '@stripe/stripe-js';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { customerCheckoutSessionsCollectionRef } from '@/firebase/firestore/references';

export async function createCheckoutSession(
  db: Firestore,
  userId: string,
  priceId: string
): Promise<void> {
  const checkoutSessionsRef = customerCheckoutSessionsCollectionRef(db, userId);

  const data = {
    price: priceId,
    success_url: window.location.origin + '/perfil',
    cancel_url: window.location.origin + '/precios',
    mode: 'subscription',
  };

  try {
    const docRef = await addDoc(checkoutSessionsRef, data);

    // Listen to the document, when the url is available, redirect
    onSnapshot(
      docRef,
      async (snap) => {
        const { error, url } = snap.data() || {};
        if (error) {
          // Show an error to your customer and inspect your Cloud Function logs in the Firebase console.
          console.error(`An error occurred: ${error.message}`);
          // We could reject the promise here, but the page will be stuck in a loading state.
          // It's often better to show a toast message to the user.
        }
        if (url) {
          // We have a Stripe Checkout URL, let's redirect.
          const stripe = await loadStripe(
            process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
          );
          if (stripe) {
            stripe.redirectToCheckout({ sessionId: snap.id });
          }
        }
      },
      (error) => {
        // General snapshot listener error
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error('Snapshot listener permission error:', error);
      }
    );
  } catch (error) {
    const permissionError = new FirestorePermissionError({
      path: checkoutSessionsRef.path,
      operation: 'create',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  }
}
