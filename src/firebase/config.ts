
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBpX-0hG49K2N1keDxsYtuosqVQ5xeukNo",
  authDomain: "benotitlan.firebaseapp.com",
  projectId: "benotitlan",
  storageBucket: "benotitlan.firebasestorage.app",
  messagingSenderId: "519461892829",
  appId: "1:519461892829:web:6a64b7af1ed6e45936a134",
  measurementId: "G-Q0K8G88QW8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
