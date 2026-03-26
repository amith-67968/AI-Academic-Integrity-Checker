import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function InputArea({ onAnalyze, loading }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef(null);

  const handleSubmit = () => {
    if (!text.trim() && !file) return;
    onAnalyze(text.trim(), file);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const acceptTypes = ".pdf,.png,.jpg,.jpeg,.bmp,.tiff,.webp,.txt";

  return (
    <div
      className="input-area"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        borderColor: isDragging ? "var(--accent)" : "var(--glass-border)",
        boxShadow: isDragging ? "0 0 0 4px rgba(234, 234, 234, 0.1)" : "none",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
      }}
    >
      <h3>Submit Content for Analysis</h3>

      <textarea
        className="text-input"
        placeholder="Paste your text here, or drag and drop a file anywhere on this card..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="upload-section">
        <input
          ref={fileRef}
          type="file"
          accept={acceptTypes}
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="file-upload"
        />

        <button className="upload-btn" onClick={() => fileRef.current?.click()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
          </svg>
          Upload File
        </button>

        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          PDF, Image, or plain text
        </span>

        <AnimatePresence>
          {file && (
            <motion.span
              className="file-name"
              initial={{ opacity: 0, scale: 0.9, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -10 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
                <polyline points="13 2 13 9 20 9"/>
              </svg>
              {file.name}
              <button className="remove-file" onClick={removeFile} aria-label="Remove document">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="analyze-bar">
        <motion.button
          className="btn-analyze"
          onClick={handleSubmit}
          disabled={loading || (!text.trim() && !file)}
          whileTap={(!loading && (text.trim() || file)) ? { scale: 0.98 } : {}}
        >
          {loading ? (
            <span className="analyzing-text">
              <span className="loading-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
              Analyzing...
            </span>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              Analyze
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
