
'use client';

import { collection, doc, CollectionReference, DocumentReference, Firestore } from "firebase/firestore";

// Helper function to create a typed collection reference
const createCollection = <T>(db: Firestore, path: string) => {
    return collection(db, path) as CollectionReference<T>;
};

// References to root collections
export const usersCollectionRef = (db: Firestore) => createCollection(db, 'users');
export const predefinedCharactersCollectionRef = (db: Firestore) => createCollection(db, 'predefinedCharacters');
export const communityStoriesCollectionRef = (db: Firestore) => createCollection(db, 'communityStories');


// References to subcollections
export const userCharactersCollectionRef = (db: Firestore, userId: string) => {
    return createCollection(db, `users/${userId}/characters`);
};

export const userStoriesCollectionRef = (db: Firestore, userId: string) => {
    return createCollection(db, `users/${userId}/stories`);
};

// Document references
export const userDocRef = (db: Firestore, userId: string) => {
    return doc(db, 'users', userId) as DocumentReference;
};

export const storyDocRef = (db: Firestore, userId: string, storyId: string) => {
    return doc(db, `users/${userId}/stories/${storyId}`) as DocumentReference;
};

    
