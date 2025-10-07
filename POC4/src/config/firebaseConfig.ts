// Firebase Configuration
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCbcuAgPHYbgU0jdvG1JS9BrCa3s6T6B5E",
  authDomain: "semiotic-runner-473916-v5.firebaseapp.com",
  projectId: "semiotic-runner-473916-v5",
  storageBucket: "semiotic-runner-473916-v5.firebasestorage.app",
  messagingSenderId: "111533515453",
  appId: "1:111533515453:web:3618a9f0630752c7310dd4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Enable persistence (mantener sesión después de recargar)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Error setting Firebase persistence:', error);
});

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
