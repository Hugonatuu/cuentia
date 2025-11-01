
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
    
    // Correct path to metadata, checking `price` first, then `items` array as a fallback.
    const priceData = primarySubscription.price || (primarySubscription.items && primarySubscription.items[0]?.price);
    const newRole = isActive ? (priceData?.metadata?.firebaseRole || null) : null;
    
    // Obtener la fecha de inicio del período actual de la suscripción
    const newPeriodStart = primarySubscription.current_period_start as Timestamp;

    await updateUserRole(db, userId, newRole, newPeriodStart, subscriptionId, onRoleChange);
  });

  return unsubscribe;
}

/**
 * Actualiza el documento del cliente con el nuevo rol y maneja el reinicio de créditos.
 * @param db - La instancia de Firestore.
 * @param userId - El ID del usuario.
 * @param newRole - El nuevo rol a establecer.
 * @param newPeriodStart - El timestamp del inicio del nuevo período de facturación.
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
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();
    const currentPeriodStart = userData?.current_period_start as Timestamp | undefined;

    const updates: { [key: string]: any } = {
      stripeRole: newRole,
      subscriptionId: subscriptionId, // Always keep the subscriptionId if one exists
    };

    // Check if the billing cycle has changed
    if (newPeriodStart && (!currentPeriodStart || newPeriodStart.toMillis() !== currentPeriodStart.toMillis())) {
      console.log('New billing cycle detected. Resetting credit count.');
      updates.monthlyCreditCount = 0; // Reset credit count
      updates.current_period_start = newPeriodStart; // Update period start date
    }

    // If there is no longer a relevant subscription, clear billing info
    if (newRole === null && subscriptionId === null) {
      updates.current_period_start = null;
      updates.subscriptionId = null;
    }

    await updateDoc(userDocRef, updates);

    console.log(`User role updated to: ${newRole}. Subscription ID: ${subscriptionId}. Updates:`, updates);
    if (onRoleChange) {
      onRoleChange(newRole);
    }
  } catch (error) {
    console.error('Error updating user role or credit count:', error);
  }
}
