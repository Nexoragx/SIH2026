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

// User-provided Firebase configuration for ANVAYA
const firebaseConfig = {
  apiKey: "AIzaSyB7iP2Fa1l45O6xQnkhBnO7nNSWZVrDepU",
  authDomain: "anvaya-4e52b.firebaseapp.com",
  projectId: "anvaya-4e52b",
  storageBucket: "anvaya-4e52b.firebasestorage.app",
  messagingSenderId: "687761596649",
  appId: "1:687761596649:web:442b8c5d1d1dba058dd078",
  measurementId: "G-9K49X4LD8D"
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
