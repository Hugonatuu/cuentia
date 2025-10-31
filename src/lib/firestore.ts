'use client';

import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  Firestore,
} from 'firebase/firestore';

/**
 * Escucha los cambios en las suscripciones de un usuario y actualiza su rol en el documento principal.
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

  const unsubscribe = onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      console.log('No active subscriptions found.');
      updateUserRole(db, userId, null, onRoleChange);
      return;
    }

    // Suponemos que solo hay una suscripción activa/trialing a la vez
    const primarySubscription = snapshot.docs[0].data();
    const isActive = ['active', 'trialing'].includes(primarySubscription.status);
    
    // Acceder al firebaseRole a través de la ruta correcta: items[0].price.metadata.firebaseRole
    const priceData = primarySubscription.items && primarySubscription.items[0]?.price;
    const newRole = isActive ? (priceData?.metadata?.firebaseRole || null) : null;

    updateUserRole(db, userId, newRole, onRoleChange);
  });

  return unsubscribe;
}

/**
 * Actualiza el campo stripeRole en el documento del cliente.
 * @param db - La instancia de Firestore.
 * @param userId - El ID del usuario.
 * @param newRole - El nuevo rol a establecer.
 * @param onRoleChange - (Opcional) Callback para notificar el cambio.
 */
async function updateUserRole(
    db: Firestore, 
    userId: string, 
    newRole: string | null,
    onRoleChange?: (newRole: string | null) => void
) {
  const userDocRef = doc(db, `customers/${userId}`);
  try {
    await updateDoc(userDocRef, {
      stripeRole: newRole,
    });
    console.log(`User role updated to: ${newRole}`);
    if (onRoleChange) {
      onRoleChange(newRole);
    }
  } catch (error) {
    console.error('Error updating user role:', error);
  }
}
