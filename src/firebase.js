// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Your Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyAB-00NW0a7Tb_nFBMdpQtmTlJC1k7bnUg",
    authDomain: "edubrain-app.firebaseapp.com",
    projectId: "edubrain-app",
    storageBucket: "edubrain-app.appspot.com",
    messagingSenderId: "845049984749",
    appId: "1:845049984749:web:2ab545b3faa2b1554d7ee4",
    measurementId: "G-17F3CDREEY"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app);
// connectFunctionsEmulator(functions, 'localhost', 5001);
// connectFirestoreEmulator(db, 'localhost', 8000);
// connectAuthEmulator(auth, 'http://localhost:9099');

//db.useEmulator('localhost', 8000);
//functions.useEmulator('localhost', 5001);
// Configure Auth to use the emulator
//auth.useEmulator('localhost',9099); // Default port for Auth emulator

export { db, auth, functions };