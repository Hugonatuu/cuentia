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
  const q = query(
    subscriptionsRef,
    where('status', 'in', ['trialing', 'active'])
  );

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    if (snapshot.empty) {
      console.log('No active subscriptions found.');
      await updateUserRole(db, userId, null, null, null, onRoleChange);
      return;
    }

    const primarySubscriptionDoc = snapshot.docs[0];
    const primarySubscription = primarySubscriptionDoc.data();
    const subscriptionId = primarySubscriptionDoc.id;
    const isActive = ['active', 'trialing'].includes(primarySubscription.status);
    
    const priceData = primarySubscription.items && primarySubscription.items[0]?.price;
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
      subscriptionId: subscriptionId,
    };

    // Comprobar si el ciclo de facturación ha cambiado
    if (newPeriodStart && (!currentPeriodStart || newPeriodStart.toMillis() !== currentPeriodStart.toMillis())) {
      console.log('New billing cycle detected. Resetting credit count.');
      updates.monthlyCreditCount = 0; // Reiniciar el contador de créditos
      updates.current_period_start = newPeriodStart; // Actualizar la fecha de inicio del período
    } else if (newRole === null) {
      // Si no hay plan, no hay fecha de inicio de período
      updates.current_period_start = null;
      updates.subscriptionId = null;
    }

    await updateDoc(userDocRef, updates);

    console.log(`User role updated to: ${newRole}. Updates:`, updates);
    if (onRoleChange) {
      onRoleChange(newRole);
    }
  } catch (error) {
    console.error('Error updating user role or credit count:', error);
  }
}
