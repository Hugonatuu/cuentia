'use client';

import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  Firestore,
  Timestamp,
  runTransaction,
  serverTimestamp,
  writeBatch,
  setDoc,
} from 'firebase/firestore';

interface Subscription {
    id: string;
    status: 'active' | 'trialing' | 'past_due' | 'incomplete' | 'canceled';
    price: {
        id: string;
        metadata: {
            firebaseRole?: string;
        }
    };
    items: {
        price: {
            id: string;
            metadata: {
                firebaseRole?: string;
            }
        }
    }[];
    current_period_start: Timestamp;
}

interface Payment {
    id: string;
    status: 'succeeded' | 'processing' | 'requires_action';
    amount: number;
    description?: string; // Can be null for one-time payments
    invoice?: string | null; // Present for subscription payments
}


/**
 * Escucha los cambios en las suscripciones de un usuario y actualiza su rol y ciclo de facturación.
 * @param db - La instancia de Firestore.
 * @param userId - El ID del usuario.
 * @param onRoleChange - (Opcional) Un callback que se ejecuta cuando el rol cambia.
 * @returns Una función para cancelar la suscripción al listener de Firestore.
 */
export function watchUserSubscription(
  db: Firestore,
  userId: string,
  onRoleChange?: (newRole: string | null) => void
) {
  const subscriptionsRef = collection(db, `customers/${userId}/subscriptions`);
  // Query for all non-canceled subscriptions to apply priority logic client-side.
  const q = query(
    subscriptionsRef,
    where('status', 'in', ['trialing', 'active', 'past_due', 'incomplete'])
  );

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    if (snapshot.empty) {
      console.log('No relevant subscriptions found.');
      await updateUserRole(db, userId, null, null, null, onRoleChange);
      return;
    }

    const subscriptions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subscription));
    
    // Priority logic to find the primary subscription
    let primarySubscription = 
      subscriptions.find(sub => ['active', 'trialing'].includes(sub.status)) ||
      subscriptions.find(sub => ['past_due', 'incomplete'].includes(sub.status)) ||
      null;

    if (!primarySubscription) {
        console.log('No active or recoverable subscription found.');
        await updateUserRole(db, userId, null, null, null, onRoleChange);
        return;
    }

    const subscriptionId = primarySubscription.id;
    const isActive = ['active', 'trialing'].includes(primarySubscription.status);
    
    // Correct path to metadata: subscription.items[0].price.metadata.firebaseRole
    const priceData = primarySubscription.items && primarySubscription.items[0]?.price;
    const newRole = priceData?.metadata?.firebaseRole || null;
    
    const newPeriodStart = primarySubscription.current_period_start as Timestamp;

    // Only grant the role if the subscription is active. If it's past_due, the role is null.
    await updateUserRole(db, userId, isActive ? newRole : null, newPeriodStart, subscriptionId, onRoleChange);
  });

  return unsubscribe;
}

/**
 * Actualiza el documento del cliente con el nuevo rol.
 * @param db - La instancia de Firestore.
 * @param userId - El ID del usuario.
 * @param newRole - El nuevo rol a establecer.
 * @param newPeriodStart - El timestamp del inicio del nuevo período de facturación (no se usa para reiniciar créditos).
 * @param subscriptionId - El ID de la suscripción.
 * @param onRoleChange - (Opcional) Callback para notificar el cambio de rol.
 */
async function updateUserRole(
    db: Firestore, 
    userId: string, 
    newRole: string | null,
    newPeriodStart: Timestamp | null,
    subscriptionId: string | null,
    onRoleChange?: (newRole: string | null) => void
) {
  const userDocRef = doc(db, `customers/${userId}`);
  
  try {
    const updates: { [key: string]: any } = {
      stripeRole: newRole,
      subscriptionId: subscriptionId,
      current_period_start: newPeriodStart, // Keep updating for informational purposes
    };
    
    if (newRole === null && subscriptionId === null) {
      updates.current_period_start = null;
      updates.subscriptionId = null;
    }

    await updateDoc(userDocRef, updates);

    console.log(`User role updated to: ${newRole}. Subscription ID: ${subscriptionId}.`);
    if (onRoleChange) {
      onRoleChange(newRole);
    }
  } catch (error) {
    console.error('Error updating user role:', error);
  }
}

/**
 * Listens for successful payments and adds credits to the user's account.
 * @param db The Firestore instance.
 * @param userId The ID of the user.
 * @returns An unsubscribe function for the listener.
 */
export function watchSuccessfulPayments(db: Firestore, userId: string) {
    const paymentsRef = collection(db, `customers/${userId}/payments`);
    const q = query(paymentsRef, where('status', '==', 'succeeded'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
            if (change.type === 'added') {
                const payment = { id: change.doc.id, ...change.doc.data() } as Payment;
                await processPayment(db, userId, payment);
            }
        });
    });

    return unsubscribe;
}

/**
 * Processes a payment in a secure transaction to update credits.
 * @param db The Firestore instance.
 * @param userId The ID of the user.
 * @param payment The payment document.
 */
async function processPayment(db: Firestore, userId: string, payment: Payment) {
    const userRef = doc(db, `customers/${userId}`);
    const receiptRef = doc(db, `customers/${userId}/payments_applied`, payment.id);

    try {
        await runTransaction(db, async (transaction) => {
            const receiptDoc = await transaction.get(receiptRef);
            if (receiptDoc.exists()) {
                console.log(`Payment ${payment.id} already processed.`);
                return;
            }

            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                 console.error(`User document for ${userId} not found.`);
                 return;
            }

            const isSubscriptionRenewal = payment.description === "Subscription update";

            if (isSubscriptionRenewal) {
                // It's a subscription renewal, reset monthly credits
                transaction.update(userRef, { monthlyCreditCount: 0 });
                console.log(`Successfully processed subscription renewal for payment ${payment.id}. Credits reset.`);
            } else {
                // It's a one-time purchase (credit pack)
                const currentCredits = userDoc.data().payAsYouGoCredits || 0;
                const newCredits = currentCredits + 4500;
                transaction.update(userRef, { payAsYouGoCredits: newCredits });
                console.log(`Successfully processed one-time payment ${payment.id}. Added 4500 credits.`);
            }
            
            // Mark the payment as processed by creating a receipt
            transaction.set(receiptRef, { appliedAt: serverTimestamp(), type: isSubscriptionRenewal ? 'subscription' : 'one-time' });
        });
    } catch (error) {
        console.error(`Error processing payment ${payment.id}:`, error);
    }
}