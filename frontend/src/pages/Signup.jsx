import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");

      if (data.session?.access_token) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="auth-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Left — Branding */}
      <div className="auth-brand">
        <div className="auth-brand-shape" />
        <div className="auth-brand-content">
          <div className="auth-brand-logo">IntegrityAI</div>
          <h2 className="auth-brand-title">
            Academic integrity, powered by AI.
          </h2>
          <p className="auth-brand-sub">
            Upload documents, paste text, and get instant AI detection results with confidence scores.
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="auth-form-side">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h1>Create account</h1>
          <p className="subtitle">Start your free trial today</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <motion.button
              type="submit"
              className="btn-primary"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? "Creating account…" : "Sign Up"}
            </motion.button>
          </form>

          <p className="link-text">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
