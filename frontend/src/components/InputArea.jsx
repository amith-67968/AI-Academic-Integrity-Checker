import { useState, useRef } from "react";

/**
 * InputArea — text input + file upload + analyze button
 */
export default function InputArea({ onAnalyze, loading }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);

  const handleSubmit = () => {
    if (!text.trim() && !file) return;
    onAnalyze(text.trim(), file);
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  const removeFile = () => {
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  // Accept these file types
  const acceptTypes = ".pdf,.png,.jpg,.jpeg,.bmp,.tiff,.webp,.txt";

  return (
    <div className="input-area">
      <h3>📝 Submit Content for Analysis</h3>

      <textarea
        className="text-input"
        placeholder="Paste or type your text here…"
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
          📎 Upload File
        </button>

        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          PDF, Image, or TXT
        </span>

        {file && (
          <span className="file-name">
            📄 {file.name}
            <button className="remove-file" onClick={removeFile}>✕</button>
          </span>
        )}
      </div>

      <div className="analyze-bar">
        <button
          className="btn-analyze"
          onClick={handleSubmit}
          disabled={loading || (!text.trim() && !file)}
        >
          {loading ? (
            <span className="analyzing-text">
              <span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              Analyzing…
            </span>
          ) : (
            "🔍 Analyze"
          )}
        </button>
      </div>
    </div>
  );
}
