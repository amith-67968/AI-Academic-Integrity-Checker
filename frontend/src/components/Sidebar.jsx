/**
 * Sidebar — ChatGPT-style history list
 */
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
        <h2>🛡️ AI Integrity Checker</h2>
        <button className="new-check-btn" onClick={onNew}>
          ＋ New Check
        </button>
      </div>

      <div className="sidebar-history">
        {history.length === 0 ? (
          <div className="empty-state" style={{ padding: "24px 12px" }}>
            <p style={{ fontSize: "0.8rem" }}>No history yet. Run your first analysis!</p>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className={`history-item ${activeId === item.id ? "active" : ""}`}
              onClick={() => onSelect(item.id)}
            >
              <div className="preview">{item.preview}</div>
              <div className="meta">
                <span>{formatDate(item.created_at)}</span>
                <span className={`badge ${item.result === "AI Generated" ? "badge-ai" : "badge-human"}`}>
                  {item.result === "AI Generated" ? "AI" : "Human"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
