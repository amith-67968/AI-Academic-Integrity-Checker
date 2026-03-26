/**
 * ResultsDisplay — shows AI/Human label, probability bars, and highlighted sentences
 */
export default function ResultsDisplay({ result }) {
  if (!result) return null;

  const isAI = result.label === "AI Generated";
  const sentences = result.highlighted_sentences || [];

  return (
    <div className="results-card">
      <h3>📊 Analysis Results</h3>

      {/* ── Label badge ──────────────────────────────────────────── */}
      <div className="result-label">
        <span className={`label-badge ${isAI ? "ai" : "human"}`}>
          {isAI ? "🤖 AI Generated" : "✍️ Human Generated"}
        </span>
      </div>

      {/* ── Probability bars ─────────────────────────────────────── */}
      <div className="probability-bars">
        <div className="prob-bar">
          <div className="prob-header">
            <span className="prob-label">AI Probability</span>
            <span className="prob-value ai-color">{result.ai_probability}%</span>
          </div>
          <div className="prob-track">
            <div
              className="prob-fill ai-fill"
              style={{ width: `${result.ai_probability}%` }}
            />
          </div>
        </div>

        <div className="prob-bar">
          <div className="prob-header">
            <span className="prob-label">Human Probability</span>
            <span className="prob-value human-color">{result.human_probability}%</span>
          </div>
          <div className="prob-track">
            <div
              className="prob-fill human-fill"
              style={{ width: `${result.human_probability}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Sentence highlighting ────────────────────────────────── */}
      {sentences.length > 0 && (
        <div className="highlighted-section">
          <h4>🔎 Sentence-Level Analysis</h4>
          <div className="sentences-list">
            {sentences.map((s, i) => (
              <div
                key={i}
                className={`sentence-item ${s.is_ai ? "ai-sentence" : "human-sentence"}`}
              >
                {s.sentence}
                <div className="sentence-prob">
                  AI confidence: {s.ai_probability}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
