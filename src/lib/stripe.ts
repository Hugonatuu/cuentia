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
) {
  const checkoutSessionsRef = customerCheckoutSessionsCollectionRef(db, userId);

  const data = {
    price: priceId,
    success_url: window.location.origin + '/perfil',
    cancel_url: window.location.origin + '/precios',
    mode: 'subscription',
  };

  try {
    // 1. Create the document and get its reference.
    const docRef = await addDoc(checkoutSessionsRef, data);

    // 2. Set up a listener on that specific document reference.
    onSnapshot(
      docRef,
      async (snap) => {
        const { error, url } = snap.data() || {};

        if (error) {
          console.error(`An error occurred: ${error.message}`);
          // Optionally, use toast to show error to the user
        }

        if (url) {
          // 3. Redirect to Stripe when the URL is available.
          const stripe = await loadStripe(
            process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
          );
          if (stripe) {
            await stripe.redirectToCheckout({ sessionId: snap.id });
          }
        }
      },
      (error) => {
        // This is the error handler for the snapshot listener itself.
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'get', // Listening is a 'get' or 'list' operation.
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error('Snapshot listener permission error:', error);
      }
    );
  } catch (error) {
    // This catches errors during the initial document creation (addDoc).
    const permissionError = new FirestorePermissionError({
      path: checkoutSessionsRef.path, // Use the collection path for create operation
      operation: 'create',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
    // Re-throw to be caught by the calling function's UI if needed.
    throw permissionError;
  }
}

    