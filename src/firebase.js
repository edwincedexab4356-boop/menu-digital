import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBoLtIq87qE0nxpRDZeY3YfTpHfu3Bo-WU",
  authDomain: "deliciasbelgi.firebaseapp.com",
  projectId: "deliciasbelgi",
  storageBucket: "deliciasbelgi.firebasestorage.app",
  messagingSenderId: "782483556174",
  appId: "1:782483556174:web:de47752d40909eef1a801f",
  measurementId: "G-6DHHV4SKKN"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
