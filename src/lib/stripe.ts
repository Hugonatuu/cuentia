'use client';

import { addDoc, onSnapshot, Firestore, doc } from 'firebase/firestore';
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

    return new Promise<void>((resolve, reject) => {
      const unsubscribe = onSnapshot(
        docRef,
        async (snap) => {
          const { error, url } = snap.data() || {};

          if (error) {
            unsubscribe();
            console.error(`An error occurred: ${error.message}`);
            reject(new Error(error.message));
          }

          if (url) {
            unsubscribe();
            const stripe = await loadStripe(
              process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
            );
            if (stripe) {
              await stripe.redirectToCheckout({ sessionId: snap.id });
              resolve();
            } else {
              reject(new Error('Stripe.js failed to load.'));
            }
          }
        },
        (error) => {
          unsubscribe();
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'get',
          });
          errorEmitter.emit('permission-error', permissionError);
          console.error('Snapshot listener permission error:', error);
          reject(permissionError);
        }
      );
    });
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