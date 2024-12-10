"use client";
import { auth, db } from "@/firebase";
import {
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import "./login.css";
import { checkUserSensitiveInfoExists } from "./register/RegisterFucntions";
import { useEffect, useState } from "react";
import { BsChatQuote } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import { IoChevronForward } from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";

import coffeeMugImg from "../../assets/img/objects/coffee-mug-1.png";
import bookImg from "../../assets/img/objects/books-4.png";
import lightBulbImg from "../../assets/img/objects/light-bulb.png";
import chairImg from "../../assets/img/objects/chair.png";

export default function Login() {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("User is already logged in", user);
        setUser(user);
      } else {
        setUser(null); // Handle if no user is logged in
      }
    });

    // Cleanup the listener on component unmount
    return () => unsubscribe();
  }, []);

  const handleAlreadyLoggedIn = () => {
    if (user) {
      const tostID = toast.loading("Checking user info...");
      checkUserSensitiveInfoExists(auth)
        .then((exists) => {
          if (exists) {
            toast.success("You'll be redirected to the dashboard", {
              id: tostID,
            });
            window.location.replace("/dashboard");
          } else {
            toast.success("You'll be redirected to register", { id: tostID });
            window.location.replace("/register");
          }
        })
        .catch((error) => {
          console.error("Error checking sensitive info:", error);
          toast.error("An error occurred. Please try again."); // Show a user-friendly error message
        });
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

      router.push("/past-paper"); // Redirect to a protected page after successful login
    } catch (error) {
      console.error("Error during Google login", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/log-in"); // Redirect to login page after sign out
    } catch (error) {
      console.error("Error during sign out", error);
    }
  };

  return (
    <div className="def-holder">
      <div className="log-in-card-wrapper">
        <div className="def-child log-in-card">
          <button
            className="logo-info"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            <div className="def-logo-img w-8">
              <img src="/main-logo.svg" />
            </div>
            <p className="def-logo-txt text-xl">EDUBRAIN</p>
          </button>
          <p>
            <BsChatQuote /> The journey of a thousand miles begins with a single
            step. – Lao Tzu
          </p>
          {!user && (
            <button onClick={handleGoogleLogin} className="log-in-btn">
              <FcGoogle /> Login
            </button>
          )}
          {user && (
            <div className="login-sessions-holder">
              <button className="session" onClick={handleAlreadyLoggedIn}>
                <div className="profile">
                  <img src={user.photoURL} />
                </div>
                <div className="more-info">
                  <div className="name">{user.displayName}</div>
                  <div className="email">{user.email}</div>
                </div>
                <IoChevronForward />
              </button>
            </div>
          )}
          <img
            src={coffeeMugImg}
            alt="image of a coffee mug"
            className="img-spaceship"
          />
          <img
            src={bookImg}
            alt="image of a book"
            className="img-apple"
          />
        </div>
        <img
          src={lightBulbImg}
          alt="image of a light bulb"
          className="img-light-bulb"
        />
        <img
          src={chairImg}
          alt="image of a chair"
          className="img-chair"
        />
      </div>
      {user && (
        <button
          className="mt-5 mb-5 text-gray-600 underline"
          onClick={handleSignOut}
        >
          sign-out
        </button>
      )}
      <Toaster position="bottom-left" />
    </div>
  );
}
