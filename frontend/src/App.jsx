import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { supabase } from "./lib/supabase";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ResultPage from "./pages/ResultPage";
import "./App.css";

function AnimatedRoutes({ session }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={!session ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/signup"
          element={!session ? <Signup /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/"
          element={<LandingPage session={session} />}
        />
        <Route
          path="/dashboard"
          element={
            session ? (
              <Dashboard session={session} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/result"
          element={
            session ? (
              <ResultPage />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <Router>
      <AnimatedRoutes session={session} />
    </Router>
  );
}

export default App;
