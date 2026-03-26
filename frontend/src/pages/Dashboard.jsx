import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import InputArea from "../components/InputArea";
import ResultsDisplay from "../components/ResultsDisplay";
import ProfilePopup from "../components/ProfilePopup";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Dashboard({ session }) {
  const [history, setHistory] = useState([]);
  const [activeResult, setActiveResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = session?.access_token;
  const user = session?.user;

  const fetchHistory = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setHistory(data.submissions || []);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleAnalyze = async (text, file) => {
    setLoading(true);
    setActiveResult(null);

    try {
      let res;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        if (text) formData.append("text", text);
        res = await fetch(`${API}/analyze`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } else {
        res = await fetch(`${API}/analyze`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      fetchHistory();
      navigate("/result", { state: { result: data } });
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = async (submissionId) => {
    try {
      const res = await fetch(`${API}/submission/${submissionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) navigate("/result", { state: { result: data } });
    } catch (err) {
      console.error("Failed to load submission:", err);
    }
  };

  const handleNewCheck = () => {
    setActiveResult(null);
  };

  return (
    <motion.div
      className="dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Sidebar
        history={history}
        onSelect={handleSelectHistory}
        onNew={handleNewCheck}
        activeId={activeResult?.id}
      />

      <div className="main-content">
        <header className="main-header">
          <h1>Dashboard</h1>
          <ProfilePopup user={user} />
        </header>

        <div className="main-body">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <InputArea onAnalyze={handleAnalyze} loading={loading} />
          </motion.div>

          {activeResult ? (
            <ResultsDisplay result={activeResult} />
          ) : (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <p>Paste text or upload a document to check for AI-generated content.</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
