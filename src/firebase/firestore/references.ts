'use client';

import { collection, doc, CollectionReference, DocumentReference, Firestore } from "firebase/firestore";

// Helper function to create a typed collection reference
const createCollection = <T>(db: Firestore, path: string) => {
    return collection(db, path) as CollectionReference<T>;
};

// References to root collections
export const usersCollectionRef = (db: Firestore) => createCollection(db, 'users');
export const predefinedCharactersCollectionRef = (db: Firestore) => createCollection(db, 'predefinedCharacters');


// References to subcollections
export const userCharactersCollectionRef = (db: Firestore, userId: string) => {
    return createCollection(db, `users/${userId}/characters`);
};

// Document references
export const userDocRef = (db: Firestore, userId: string) => {
    return doc(db, 'users', userId) as DocumentReference;
};
