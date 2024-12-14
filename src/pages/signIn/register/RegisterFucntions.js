"use client";
import { functions, db, auth } from "@/firebase";
import { httpsCallable } from "firebase/functions";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const callRegisterFunction = async (data) => {
  try {
    const storeUserInfo = httpsCallable(functions, "StoreUserRegisterInfo");
    const result = await storeUserInfo(data);
    console.log(result.data.message); // Handle success message
  } catch (error) {
    throw new Error(error.message); // Handle error message
  }
};

const checkUserSensitiveInfoExists = async (auth) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User is not authenticated"); // Add a check for user authentication

  const docRef = doc(db, "users", user.uid, "user-sensitive-info", user.uid);
  const docSnapshot = await getDoc(docRef);

  // Call the exists() method to check if the document exists
  if (docSnapshot.exists()) {
    return true; // Document exists
  } else {
    return false; // Document does not exist
  }
};

const handleGoogleLogin = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const results = await signInWithPopup(auth, provider);
    console.log("Google login results", auth.currentUser);
    const user = results.user;

    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL,
      lastLogin: new Date(),
    });
    const userSenInfoDoc = await getDoc(
      doc(db, "users", user.uid, "user-sensitive-info", user.uid)
    );
    if (userSenInfoDoc.exists()) {
      window.location.replace("/dashboard"); // Redirect to a protected page after successful login
    } else {
      window.location.replace("/log-in"); // Redirect to a page to collect more data
    }
  } catch (error) {
    console.error("Error during Google login", error);
  }
};

export {
  callRegisterFunction,
  checkUserSensitiveInfoExists,
  handleGoogleLogin,
};
