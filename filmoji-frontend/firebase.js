// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQxSKs-oU5hUE9xbUDLgKvrw71tSOWiY0",
  authDomain: "filmoji-7c2f1.firebaseapp.com",
  projectId: "filmoji-7c2f1",
  storageBucket: "filmoji-7c2f1.firebasestorage.app",
  messagingSenderId: "653397140901",
  appId: "1:653397140901:web:c4b328607af24aa19cf44c",
  measurementId: "G-CPGKNVGSNK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth services
export const db = getFirestore(app);         

// Initialize Firebase Authentication and export it for use in other files
export const auth = getAuth(app);            
