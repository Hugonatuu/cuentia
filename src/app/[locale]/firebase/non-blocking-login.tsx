'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
  User,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { doc, serverTimestamp } from 'firebase/firestore';
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
    emailVerified: user.emailVerified,
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
  password: string,
  displayName: string,
  onSuccess?: () => void
): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .then(async (userCredential) => {
      // Update profile first
      await updateProfile(userCredential.user, { displayName });

      // Then create user document with all info and send verification
      createUserDocument(userCredential.user);
      sendEmailVerification(userCredential.user);

      // Sign out to force user to log in after verification
      await authInstance.signOut();
      onSuccess?.();
    })
    .catch((error) => {
      console.error('Sign-up error:', error);
      // Optionally, handle specific errors and show toasts
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(
  authInstance: Auth,
  email: string,
  password: string,
  onSuccess: (user: User) => void,
  onError: (error: any) => void,
): void {
  signInWithEmailAndPassword(authInstance, email, password)
    .then((userCredential) => {
      createUserDocument(userCredential.user); // Create/merge user doc
      onSuccess(userCredential.user);
    })
    .catch((error) => {
       onError(error);
    });
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
