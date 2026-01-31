// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAq2ctzCPsn_104Ad1SjJq5MCz-1NTCz8o",
  authDomain: "ph-library-c6153.firebaseapp.com",
  projectId: "ph-library-c6153",
  storageBucket: "ph-library-c6153.appspot.com",
  messagingSenderId: "406029474757",
  appId: "1:406029474757:web:7e862f9edfdb2a6219c9ac"
};

const app = initializeApp(firebaseConfig);

// THESE ARE THE IMPORTANT EXPORTS
export const auth = getAuth(app); 
export const db = getFirestore(app);