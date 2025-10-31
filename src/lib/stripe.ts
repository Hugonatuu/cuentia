'use client';

import { addDoc, onSnapshot, Firestore, Unsubscribe } from 'firebase/firestore';
import { loadStripe } from '@stripe/stripe-js';
import { customerCheckoutSessionsCollectionRef } from '@/firebase/firestore/references';

export async function createCheckoutSession(
  db: Firestore,
  userId: string,
  priceId: string
): Promise<string> {
  const checkoutSessionsRef = customerCheckoutSessionsCollectionRef(db, userId);
  
  // Create a new checkout session document in Firestore.
  const docRef = await addDoc(checkoutSessionsRef, {
    price: priceId,
    success_url: window.location.origin + '/perfil',
    cancel_url: window.location.origin + '/precios',
    mode: 'subscription',
  });

  // Return a new promise that resolves with the session ID.
  return new Promise((resolve, reject) => {
    // Set up a listener on the new document.
    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        const { error, sessionId } = snap.data() || {};
        if (error) {
          // If Stripe reports an error, reject the promise and unsubscribe.
          unsubscribe();
          reject(new Error(error.message));
        }
        if (sessionId) {
          // If we get a session ID, resolve the promise and unsubscribe.
          unsubscribe();
          resolve(sessionId);
        }
      },
      (err) => {
        // If the listener fails, reject the promise and unsubscribe.
        unsubscribe();
        reject(err);
      }
    );
  });
}