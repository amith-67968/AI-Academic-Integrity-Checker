import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (!result) {
      navigate("/");
      return;
    }
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, [result, navigate]);

  if (!result) return null;

  const isAI = result.label === "AI Generated";
  const aiProb = Number(result.ai_probability) || 0;
  const humanProb = Number(result.human_probability) || 0;
  const sentences = result.highlighted_sentences || [];

  // SVG gauge calculation
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (aiProb / 100) * circumference;

  return (
    <div className="result-page">
      {/* Background Effects */}
      <div className="result-bg">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
      </div>

      {/* Header */}
      <header className="result-header">
        <button className="result-back-btn" onClick={() => navigate("/")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Dashboard
        </button>
        <h1 className="result-page-title">Analysis Results</h1>
        <button className="result-new-btn" onClick={() => navigate("/")}>
          + New Analysis
        </button>
      </header>

      <div className="result-content">
        {/* Gauge Section */}
        <div className={`result-gauge-section ${animated ? 'animated' : ''}`}>
          <div className="result-gauge-container">
            <svg viewBox="0 0 200 200" className="result-gauge-svg">
              {/* Background circle */}
              <circle cx="100" cy="100" r={radius} fill="none"
                stroke="rgba(148,163,184,0.08)" strokeWidth="12"/>
              {/* Animated fill circle */}
              <circle cx="100" cy="100" r={radius} fill="none"
                stroke={isAI ? "url(#result-gauge-danger)" : "url(#result-gauge-success)"}
                strokeWidth="12" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={animated ? offset : circumference}
                transform="rotate(-90 100 100)"
                className="gauge-circle-fill"
              />
              <defs>
                <linearGradient id="result-gauge-danger" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444"/>
                  <stop offset="100%" stopColor="#f97316"/>
                </linearGradient>
                <linearGradient id="result-gauge-success" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981"/>
                  <stop offset="100%" stopColor="#34d399"/>
                </linearGradient>
              </defs>
            </svg>
            <div className="gauge-center-text">
              <span className={`gauge-percentage ${isAI ? 'danger' : 'success'}`}>
                {animated ? aiProb.toFixed(1) : '0.0'}%
              </span>
              <span className="gauge-sub-label">AI Probability</span>
            </div>
          </div>

          {/* Verdict */}
          <div className={`result-verdict ${isAI ? 'verdict-ai' : 'verdict-human'}`}>
            <span className="verdict-icon">{isAI ? '🤖' : '✍️'}</span>
            <span className="verdict-text">{isAI ? 'AI Generated' : 'Human Written'}</span>
          </div>
        </div>

        {/* Probability Bars */}
        <div className="result-prob-grid">
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
        </div>

        {/* Sentence Analysis */}
        {sentences.length > 0 && (
          <div className="result-sentences-section">
            <div className="sentences-header">
              <h2>Sentence-Level Analysis</h2>
              <span className="sentences-count">{sentences.length} sentences analyzed</span>
            </div>
            <div className="sentences-grid">
              {sentences.map((s, i) => (
                <div
                  key={i}
                  className={`sentence-card ${s.is_ai ? 'sentence-ai' : 'sentence-human'}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="result-actions">
          <button className="btn-result-primary" onClick={() => navigate("/")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
