import { initializeApp } from 'firebase/app';

import { GoogleAuthProvider, connectAuthEmulator, getAuth,onAuthStateChanged,signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { getDatabase } from "firebase/database";

import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

// console.log('env: ', process.env)

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// emu
// if (process.env.NODE_ENV === 'development') {
if (process.env.REACT_APP_USE_EMU === 'true') {
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
}
// const db = getFirestore(app);

export const database = getDatabase(app);
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: 'select_account'
});


export const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const signIn2 = ()=> signInWithPopup(auth, googleAuthProvider);
export const onAuthStateChanged2 = (cb) => onAuthStateChanged(auth, cb);

export const db = getFirestore(app);

// emu
//if (process.env.NODE_ENV === 'development') {
if (process.env.REACT_APP_USE_EMU === 'true') {
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}