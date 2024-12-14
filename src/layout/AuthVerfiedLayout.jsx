"use client"; // Required to use hooks in the App Router

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AuthVerifiedLayout({ children }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Redirect immediately if the user is not authenticated or doesn't have more data
  useEffect(() => {
    if (!currentUser) {
      navigate("/log-in") // Redirect to the home page if not authenticated or no more data
    } else {
      setLoading(false); // Stop loading once the user is verified and has the required data
    }
  }, [currentUser]);

  // Show loading spinner or message while we verify the user
  if (loading) {
    return <div>Loading...</div>; // Or null or a spinner
  }

  return <div>{children}</div>;
}
