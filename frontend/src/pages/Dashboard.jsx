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
  
    const handleDeleteHistory = async (submissionId) => {
      try {
        const res = await fetch(`${API}/submission/${submissionId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.ok) {
          setHistory((prev) => prev.filter((item) => item.id !== submissionId));
          if (activeResult?.id === submissionId) {
            setActiveResult(null);
          }
        } else {
          const data = await res.json();
          console.error("Failed to delete submission:", data.error);
        }
      } catch (err) {
        console.error("Failed to delete submission:", err);
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
        onDelete={handleDeleteHistory}
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

          {activeResult && <ResultsDisplay result={activeResult} />}
        </div>
      </div>
    </motion.div>
  );
}
