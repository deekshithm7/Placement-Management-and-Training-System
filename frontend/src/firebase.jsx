// Modified firebase/config.js file

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCPNAz_O2_GJoBgBheyxJ9r2VRmEERJ_bo",
    authDomain: "pmts0-186c0.firebaseapp.com",
    projectId: "pmts0-186c0",
    storageBucket: "pmts0-186c0.firebasestorage.app",
    messagingSenderId: "625581160130",
    appId: "1:625581160130:web:e257b161d55a33917bed5b",
    measurementId: "G-6ZT0ECWXW6"
  };

// Initialize Firebase - with check to prevent duplicate initialization
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  // If an app is already initialized, use that one
  if (error.code === 'app/duplicate-app') {
    console.info('Firebase app already exists, using existing app');
    app = firebase.app(); // Use existing app
  } else {
    console.error('Firebase initialization error:', error);
    throw error;
  }
}

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };