import { getAuth } from "firebase/auth";
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyCbcuAgPHYbgU0jdvG1JS9BrCa3s6T6B5E",
  authDomain: "semiotic-runner-473916-v5.firebaseapp.com",
  projectId: "semiotic-runner-473916-v5",
  storageBucket: "semiotic-runner-473916-v5.firebasestorage.app",
  messagingSenderId: "111533515453",
  appId: "1:111533515453:web:3618a9f0630752c7310dd4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Ejemplo de cómo inicializar Firebase:
/*
import { getAuth } from 'firebase/auth';

export const auth = getAuth(app);
*/
