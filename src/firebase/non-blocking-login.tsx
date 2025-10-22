'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
} from 'firebase/auth';
import { getFirestore, doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from './non-blocking-updates';
import { initializeFirebase } from '.';

/** Helper function to create a user document in Firestore. */
function createUserDocument(user: UserCredential['user']) {
  if (!user) return;

  const { firestore } = initializeFirebase();
  const userRef = doc(firestore, 'users', user.uid);
  const userData = {
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    createdAt: serverTimestamp(),
  };

  // Use the non-blocking function to create the document.
  setDocumentNonBlocking(userRef, userData, { merge: true });
}

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance);
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(
  authInstance: Auth,
  email: string,
  password: string
): void {
  createUserWithEmailAndPassword(authInstance, email, password).then(
    (userCredential) => {
      // On successful creation, create the user document.
      createUserDocument(userCredential.user);
    }
  );
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(
  authInstance: Auth,
  email: string,
  password: string
): void {
  signInWithEmailAndPassword(authInstance, email, password);
}

/** Initiate Google sign-in (non-blocking). */
export function initiateGoogleSignIn(authInstance: Auth): void {
  const provider = new GoogleAuthProvider();
  signInWithPopup(authInstance, provider)
    .then((userCredential) => {
      // On successful sign-in, create the user document (it will merge if it exists).
      createUserDocument(userCredential.user);
    })
    .catch((error) => {
      console.error('Google Sign-In Error:', error);
    });
}
