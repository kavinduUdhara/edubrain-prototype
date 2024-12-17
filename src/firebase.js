// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import {initializeAppCheck, ReCaptchaV3Provider} from "firebase/app-check";

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyB_NrAkejLwEIlDRnMDmemA2yy6Uf1Xr1g",
  authDomain: "edubrain-app.firebaseapp.com",
  projectId: "edubrain-app",
  storageBucket: "edubrain-app.appspot.com",
  messagingSenderId: "845049984749",
  appId: "1:845049984749:web:b5bdbb4f99c008554d7ee4",
  measurementId: "G-TEXCX14NRT"
};

const app = initializeApp(firebaseConfig);

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6Lenq50qAAAAAOIZfFFnphZifq8pqfMdP-mTkPHw'),
  isTokenAutoRefreshEnabled: true
});

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