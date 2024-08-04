// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6Vit5H7cdiArzPvOlWQJectOtovW0SGw",
  authDomain: "amanpantryapp.firebaseapp.com",
  projectId: "amanpantryapp",
  storageBucket: "amanpantryapp.appspot.com",
  messagingSenderId: "202782511031",
  appId: "1:202782511031:web:aed50af7708d9d28b3e232",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth();

export { firestore, storage, auth };
