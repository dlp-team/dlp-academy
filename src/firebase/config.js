// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDPIEiAOkCkAm24X9KOiMUoV1f5PXwDC5s",
  authDomain: "dlp-academ.firebaseapp.com",
  projectId: "dlp-academ",
  storageBucket: "dlp-academ.firebasestorage.app",
  messagingSenderId: "947726276287",
  appId: "1:947726276287:web:02fc881bfe6fdc1758180a",
  measurementId: "G-LE6R2DFP9Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);