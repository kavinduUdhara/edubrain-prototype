// app/dashboard/page.js
"use client"; // Required to use hooks in the App Router

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const AuthProtectedLayout = ({ children }) => {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      window.location.href = "/"; // Redirect to the home page if not authenticated
    }
  }, [currentUser]);

  if (!currentUser) {
    return <div>Loading...</div>; // Or null or a spinner
  }

  return <div>{children}</div>;
};

export default AuthProtectedLayout;
