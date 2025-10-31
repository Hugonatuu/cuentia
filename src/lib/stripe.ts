'use client';

import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  Firestore,
} from 'firebase/firestore';
import { loadStripe } from '@stripe/stripe-js';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function createCheckoutSession(
  db: Firestore,
  userId: string,
  priceId: string
) {
  const checkoutSessionsRef = collection(
    db,
    'users',
    userId,
    'checkout_sessions'
  );
  const data = {
    price: priceId,
    success_url: window.location.origin,
    cancel_url: window.location.origin,
    mode: 'subscription',
  };

  addDoc(checkoutSessionsRef, data)
    .then((docRef) => {
      onSnapshot(docRef, async (snap) => {
        const { error, url } = snap.data() || {};
        if (error) {
          console.error(`An error occurred: ${error.message}`);
          // TODO: Display a toast to the user about the error.
        }
        if (url) {
          const stripe = await loadStripe(
            process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
          );
          if (stripe) {
            await stripe.redirectToCheckout({ sessionId: snap.id });
          }
        }
      }, (error) => {
        // This is the error callback for the onSnapshot listener itself.
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error('Snapshot listener error:', error);
      });
    })
    .catch((error) => {
      // This catches errors from the initial addDoc operation.
      const permissionError = new FirestorePermissionError({
        path: `users/${userId}/checkout_sessions`,
        operation: 'create',
        requestResourceData: data,
      });
      errorEmitter.emit('permission-error', permissionError);
      console.error('Error creating document:', error);
    });
}
