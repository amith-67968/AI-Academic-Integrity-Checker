import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function ResultsDisplay({ result }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(timer);
  }, [result]);

  if (!result) return null;

  const isAI = result.label === "AI Generated";
  const aiProb = Number(result.ai_probability) || 0;
  const humanProb = Number(result.human_probability) || 0;
  const sentences = result.highlighted_sentences || [];

  return (
    <div className="results-card">
      <div className="result-label">
        <span className={`label-badge ${isAI ? "ai" : "human"}`}>
          {isAI ? "AI Generated" : "Human Written"}
        </span>
      </div>

      <div className="probability-bars">
        <div className="prob-bar">
          <div className="prob-header">
            <span className="prob-label">AI Probability</span>
            <span className="prob-value ai-color">{aiProb.toFixed(1)}%</span>
          </div>
          <div className="prob-track">
            <div
              className="prob-fill ai-fill"
              style={{ width: animated ? `${aiProb}%` : "0%" }}
            />
          </div>
        </div>

        <div className="prob-bar">
          <div className="prob-header">
            <span className="prob-label">Human Probability</span>
            <span className="prob-value human-color">{humanProb.toFixed(1)}%</span>
          </div>
          <div className="prob-track">
            <div
              className="prob-fill human-fill"
              style={{ width: animated ? `${humanProb}%` : "0%" }}
            />
          </div>
        </div>
      </div>

      {sentences.length > 0 && (
        <div className="highlighted-section">
          <h4>Sentence Analysis ({sentences.length})</h4>
          <div className="sentences-list">
            {sentences.map((s, i) => (
              <motion.div
                key={i}
                className={`sentence-item ${s.is_ai ? "ai-sentence" : "human-sentence"}`}
                initial={{ opacity: 0, x: -8 }}
                animate={animated ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                {s.sentence}
                <div className="sentence-prob">
                  {s.ai_probability}% AI
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
