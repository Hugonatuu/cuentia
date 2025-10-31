'use client';

import { addDoc, onSnapshot, Firestore, Unsubscribe } from 'firebase/firestore';
import { loadStripe } from '@stripe/stripe-js';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { customerCheckoutSessionsCollectionRef } from '@/firebase/firestore/references';

export async function createCheckoutSession(
  db: Firestore,
  userId: string,
  priceId: string
): Promise<void> {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw new Error(
      'La clave publicable de Stripe no está configurada. Por favor, añádela a tu archivo .env.local'
    );
  }

  const checkoutSessionsRef = customerCheckoutSessionsCollectionRef(db, userId);
  let unsubscribe: Unsubscribe | null = null;

  try {
    const docRef = await addDoc(checkoutSessionsRef, {
      price: priceId,
      success_url: window.location.origin + '/perfil',
      cancel_url: window.location.origin + '/precios',
      mode: 'subscription',
    });

    unsubscribe = onSnapshot(docRef, async (snap) => {
      const data = snap.data();
      const { error, sessionId } = data || {};

      if (error) {
        console.error(`An error occurred: ${error.message}`);
        if (unsubscribe) unsubscribe();
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: docRef.path,
            operation: 'get',
          })
        );
      }
      
      if (sessionId) {
        if (unsubscribe) unsubscribe();
        const stripe = await loadStripe(publishableKey);
        if (stripe) {
          await stripe.redirectToCheckout({ sessionId });
        }
      }
    });
  } catch (error) {
    console.error('Error creating checkout session document:', error);
    if (error instanceof Error && error.name === 'FirebaseError') {
      errorEmitter.emit('permission-error', error as FirestorePermissionError);
    }
  }
}
