import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (!result) { navigate("/"); return; }
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, [result, navigate]);

  if (!result) return null;

  const isAI = result.label === "AI Generated";
  const aiProb = Number(result.ai_probability) || 0;
  const humanProb = Number(result.human_probability) || 0;
  const sentences = result.highlighted_sentences || [];

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (aiProb / 100) * circumference;

  return (
    <motion.div
      className="result-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="result-bg">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
      </div>

      <header className="result-header">
        <motion.button
          className="result-back-btn"
          onClick={() => navigate("/")}
          whileTap={{ scale: 0.98 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Dashboard
        </motion.button>
        <h1 className="result-page-title">Analysis Results</h1>
        <motion.button
          className="result-new-btn"
          onClick={() => navigate("/")}
          whileTap={{ scale: 0.98 }}
        >
          + New Analysis
        </motion.button>
      </header>

      <div className="result-content">
        {/* Gauge */}
        <motion.div
          className="result-gauge-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="result-gauge-container">
            <svg viewBox="0 0 200 200" className="result-gauge-svg">
              <circle cx="100" cy="100" r={radius} fill="none"
                stroke="rgba(255,255,255,0.04)" strokeWidth="10"/>
              <circle cx="100" cy="100" r={radius} fill="none"
                stroke={isAI ? "#EF4444" : "#22C55E"}
                strokeWidth="10" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={animated ? offset : circumference}
                transform="rotate(-90 100 100)"
                className="gauge-circle-fill"
                style={{ opacity: 0.8 }}
              />
            </svg>
            <div className="gauge-center-text">
              <span className={`gauge-percentage ${isAI ? 'danger' : 'success'}`}>
                {animated ? aiProb.toFixed(1) : '0.0'}%
              </span>
              <span className="gauge-sub-label">AI Probability</span>
            </div>
          </div>

          <div className={`result-verdict ${isAI ? 'verdict-ai' : 'verdict-human'}`}>
            <span className="verdict-icon">{isAI ? '🤖' : '✍️'}</span>
            <span className="verdict-text">{isAI ? 'AI Generated' : 'Human Written'}</span>
          </div>
        </motion.div>

        {/* Probability Cards */}
        <motion.div
          className="result-prob-grid"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="result-prob-card">
            <div className="prob-card-header">
              <span className="prob-card-label">AI Probability</span>
              <span className="prob-card-value danger">{aiProb.toFixed(1)}%</span>
            </div>
            <div className="prob-card-track">
              <div className="prob-card-fill danger-fill"
                style={{ width: animated ? `${aiProb}%` : '0%' }} />
            </div>
          </div>
          <div className="result-prob-card">
            <div className="prob-card-header">
              <span className="prob-card-label">Human Probability</span>
              <span className="prob-card-value success">{humanProb.toFixed(1)}%</span>
            </div>
            <div className="prob-card-track">
              <div className="prob-card-fill success-fill"
                style={{ width: animated ? `${humanProb}%` : '0%' }} />
            </div>
          </div>
        </motion.div>

        {/* Confidence */}
        <motion.div
          className="result-prob-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <div className="prob-card-header">
            <span className="prob-card-label">Confidence Level</span>
            <span className="prob-card-value" style={{ color: 'var(--nude)' }}>
              {result.confidence ? `${result.confidence}%` : `${Math.max(aiProb, humanProb).toFixed(0)}%`}
            </span>
          </div>
          <div className="prob-card-track">
            <div className="prob-card-fill"
              style={{
                width: animated ? `${result.confidence || Math.max(aiProb, humanProb)}%` : '0%',
                background: 'var(--nude)',
                opacity: 0.6,
                height: '100%',
                borderRadius: '3px',
                transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)'
              }} />
          </div>
        </motion.div>

        {/* Sentence Analysis */}
        {sentences.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <div className="sentences-header">
              <h2>Sentence-Level Analysis</h2>
              <span className="sentences-count">{sentences.length} sentences</span>
            </div>
            <div className="sentences-grid">
              {sentences.map((s, i) => (
                <motion.div
                  key={i}
                  className={`sentence-card ${s.is_ai ? 'sentence-ai' : 'sentence-human'}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.03 }}
                >
                  <div className="sentence-indicator">
                    <div className={`indicator-dot ${s.is_ai ? 'dot-ai' : 'dot-human'}`} />
                    <span className="indicator-label">{s.is_ai ? 'AI' : 'Human'}</span>
                  </div>
                  <p className="sentence-text">{s.sentence}</p>
                  <div className="sentence-footer">
                    <div className="sentence-mini-bar">
                      <div className={`mini-bar-fill ${s.is_ai ? 'danger-fill' : 'success-fill'}`}
                        style={{ width: `${s.ai_probability}%` }} />
                    </div>
                    <span className={`sentence-confidence ${s.is_ai ? 'danger' : 'success'}`}>
                      {s.ai_probability}% AI
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="result-actions">
          <motion.button
            className="btn-result-primary"
            onClick={() => navigate("/")}
            whileTap={{ scale: 0.98 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Analysis
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
