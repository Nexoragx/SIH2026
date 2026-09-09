import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

// Firebase configuration for ANVAYA (reads from environment variables with fallback)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB7iP2Fa1l45O6xQnkhBnO7nNSWZVrDepU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "anvaya-4e52b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "anvaya-4e52b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "anvaya-4e52b.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "687761596649",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:687761596649:web:442b8c5d1d1dba058dd078",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-9K49X4LD8D"
};

// Initialize Firebase app singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged,
};

export type { FirebaseUser };
