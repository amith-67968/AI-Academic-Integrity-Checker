import { motion } from "framer-motion";
import { X } from "lucide-react";

export default function Sidebar({ history, onSelect, onNew, onDelete, activeId }) {

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

      <div className="sidebar-history relative">
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
              className={`history-item group relative ${activeId === item.id ? "active" : ""}`}
              onClick={() => onSelect(item.id)}
              whileHover={{ x: 2 }}
            >
              <div className="preview pr-6">{item.preview}</div>
              <div className="meta group-hover:opacity-0 transition-opacity duration-200">
                <span>{formatDate(item.created_at)}</span>
                <span className={`badge ${item.result === "AI Generated" ? "badge-ai" : "badge-human"}`}>
                  {item.result === "AI Generated" ? "AI" : "Human"}
                </span>
              </div>
              
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                <button
                  className="p-1.5 flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-200 bg-transparent hover:bg-white/[0.08] outline-none border-none shadow-none rounded-md transition-all duration-200 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  title="Delete record"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </aside>
  );
}
