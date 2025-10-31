
'use client';

import { collection, doc, CollectionReference, DocumentReference, Firestore } from "firebase/firestore";

// Helper function to create a typed collection reference
const createCollection = <T>(db: Firestore, path: string) => {
    return collection(db, path) as CollectionReference<T>;
};

// References to root collections
export const customersCollectionRef = (db: Firestore) => createCollection(db, 'customers');
export const predefinedCharactersCollectionRef = (db: Firestore) => createCollection(db, 'predefinedCharacters');
export const communityStoriesCollectionRef = (db: Firestore) => createCollection(db, 'communityStories');


// References to subcollections
export const userCharactersCollectionRef = (db: Firestore, userId: string) => {
    return createCollection(db, `customers/${userId}/characters`);
};

export const userStoriesCollectionRef = (db: Firestore, userId: string) => {
    return createCollection(db, `customers/${userId}/stories`);
};

export const customerCheckoutSessionsCollectionRef = (db: Firestore, userId: string) => {
    return createCollection(db, `customers/${userId}/checkout_sessions`);
};

export const customerSubscriptionsCollectionRef = (db: Firestore, userId: string) => {
    return createCollection(db, `customers/${userId}/subscriptions`);
};


// Document references
export const userDocRef = (db: Firestore, userId: string) => {
    return doc(db, 'customers', userId) as DocumentReference;
};

export const storyDocRef = (db: Firestore, userId: string, storyId: string) => {
    return doc(db, `customers/${userId}/stories/${storyId}`) as DocumentReference;
};

export const communityStoryDocRef = (db: Firestore, storyId: string) => {
    return doc(db, 'communityStories', storyId) as DocumentReference;
};

    

    