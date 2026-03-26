import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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

  // ── Fetch history on mount ────────────────────────────────────
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

  // ── Analyse text ──────────────────────────────────────────────
  const handleAnalyze = async (text, file) => {
    setLoading(true);
    setActiveResult(null);

    try {
      let res;
      if (file) {
        // File upload → multipart form
        const formData = new FormData();
        formData.append("file", file);
        if (text) formData.append("text", text);
        res = await fetch(`${API}/analyze`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } else {
        // Plain text → JSON
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

      fetchHistory(); // refresh sidebar
      navigate("/result", { state: { result: data } });
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Load a past submission ────────────────────────────────────
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

  // ── New check (clear result) ──────────────────────────────────
  const handleNewCheck = () => {
    setActiveResult(null);
  };

  return (
    <div className="dashboard">
      <Sidebar
        history={history}
        onSelect={handleSelectHistory}
        onNew={handleNewCheck}
        activeId={activeResult?.id}
      />

      <div className="main-content">
        <div className="main-header">
          <h1>🛡️ AI Academic Integrity Checker</h1>
          <ProfilePopup user={user} />
        </div>

        <div className="main-body">
          <InputArea onAnalyze={handleAnalyze} loading={loading} />

          {activeResult ? (
            <ResultsDisplay result={activeResult} />
          ) : (
            <div className="empty-state">
              <div className="icon">🔍</div>
              <p>Paste text or upload a document and click <strong>Analyze</strong> to check for AI-generated content.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
