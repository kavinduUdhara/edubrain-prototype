"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Create an AuthContext to provide authentication state
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

// AuthProvider component to wrap your app and provide auth state
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch the user role and additional data from Firestore
        //const userDoc = await getDoc(doc(db, 'users', user.uid));
        //if (userDoc.exists()) {
        //  const userData = userDoc.data();
        //  user.role = userData.role; // Add the role to the user object
        //  user.firstName = userData.firstName;
        //  user.lastName = userData.lastName;
        //  user.photoURL = userData.photoURL;
        //}
        setCurrentUser(user); // Set the currentUser with the additional data
      } else {
        setCurrentUser(null);
      }
      setLoading(false); // Set loading to false once the auth state is resolved
    });

    // Cleanup the subscription on unmount
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    // You can add other auth-related functions here, e.g., signUp, login, logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} {/* Render children only when not loading */}
    </AuthContext.Provider>
  );
};
