// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBniAJ49_SbeS_kef2-OXOhNA1mulzOlvA",
  authDomain: "filmoji-42e2f.firebaseapp.com",
  projectId: "filmoji-42e2f",
  storageBucket: "filmoji-42e2f.firebasestorage.app",
  messagingSenderId: "794180102133",
  appId: "1:794180102133:web:2dcda68f31a9775ff7e2bc",
  measurementId: "G-MFRQF8S1YN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth services
export const db = getFirestore(app);         

// Initialize Firebase Authentication and export it for use in other files
export const auth = getAuth(app);            
