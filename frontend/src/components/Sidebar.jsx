import { motion } from "framer-motion";

export default function Sidebar({ history, onSelect, onNew, activeId }) {

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>IntegrityAI</h2>
        <motion.button
          className="new-check-btn"
          onClick={onNew}
          whileTap={{ scale: 0.98 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Check
        </motion.button>
      </div>

      <div className="sidebar-history">
        {history.length === 0 ? (
          <div className="empty-state" style={{ padding: "24px 12px" }}>
            <p style={{ fontSize: "0.8rem", textAlign: "center", color: "var(--text-muted)" }}>
              No history yet. Start your first analysis.
            </p>
          </div>
        ) : (
          history.map((item) => (
            <motion.div
              key={item.id}
              className={`history-item ${activeId === item.id ? "active" : ""}`}
              onClick={() => onSelect(item.id)}
              whileHover={{ x: 2 }}
            >
              <div className="preview">{item.preview}</div>
              <div className="meta">
                <span>{formatDate(item.created_at)}</span>
                <span className={`badge ${item.result === "AI Generated" ? "badge-ai" : "badge-human"}`}>
                  {item.result === "AI Generated" ? "AI" : "Human"}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </aside>
  );
}
