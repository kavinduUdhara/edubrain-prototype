import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthProtectedLayout from "./layout/AuthProtecetdLayout";
import AuthVerifiedLayout from "./layout/AuthVerfiedLayout";
import "./App.css";
import Home from "./pages/home/Home";
import Dashboard from "./pages/dashboard/Dashboard";
import PaperPractice from "./pages/paperPractice/paperPractice";
import Login from "./pages/signIn/SignIn";
import AttemptSummaryPage from "./pages/paperPractice/AttemptSummary/AttemptSummary";
import RegisterPage from "./pages/signIn/register/Register";

import { auth } from "./firebase";
import { useEffect } from "react";

function App() {
  // Google Analytics user ID tracking
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      window.gtag("js", new Date());
      if (user) {
        // Send user ID to Google Analytics
        window.gtag("config", "G-V1V8X1QF8Q", {
          user_id: user.uid, // Send the logged-in user's ID
        });
      } else {
        // Clear user ID when not logged in
        window.gtag("config", "G-V1V8X1QF8Q", {
          user_id: null, // Clear user ID if logged out
        });
      }
    });

    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      {/* Dynamic Navigation */}

      {/* Define Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<Login />} />
        <Route
          path="/log-in"
          element={
            <AuthProtectedLayout>
              <RegisterPage />
            </AuthProtectedLayout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <AuthVerifiedLayout>
              <Dashboard />
            </AuthVerifiedLayout>
          }
        />
        <Route
          path="/paper-practice/:pp_id"
          element={
            <AuthVerifiedLayout>
              <PaperPractice />
            </AuthVerifiedLayout>
          }
        />
        <Route path="/paper-practice" element={<Navigate to="/dashboard" />} />
        <Route
          path="/paper-attempt/:att_id"
          element={
            <AuthVerifiedLayout>
              <AttemptSummaryPage />
            </AuthVerifiedLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
