"""
ML Module — TF-IDF + Logistic Regression classifier for AI text detection.

Functions:
  load_model()          → loads saved pipeline from disk
  analyze_text(text)    → returns label, probabilities, highlighted sentences
"""

import os
import re
import joblib
import nltk

# Download punkt tokenizer data (needed for sentence splitting)
try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    nltk.download('punkt_tab', quiet=True)

from nltk.tokenize import sent_tokenize

# ── Paths ────────────────────────────────────────────────────────────────────
MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
MODEL_PATH = os.path.join(MODEL_DIR, "ai_detector_pipeline.pkl")

# ── Global model reference (loaded once) ─────────────────────────────────────
_pipeline = None


def load_model():
    """Load the trained TF-IDF + Logistic Regression pipeline from disk."""
    global _pipeline
    if _pipeline is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Model file not found at {MODEL_PATH}. "
                "Run `python train_model.py` first."
            )
        _pipeline = joblib.load(MODEL_PATH)
    return _pipeline


def _predict_proba(pipeline, text):
    """Return (ai_probability, human_probability) for a single text string."""
    probs = pipeline.predict_proba([text])[0]
    # Class order: index 0 = 'ai', index 1 = 'human'
    classes = list(pipeline.classes_)
    ai_idx = classes.index("ai")
    human_idx = classes.index("human")
    return float(probs[ai_idx]), float(probs[human_idx])


def analyze_text(text: str) -> dict:
    """
    Analyse the submitted text and return structured results.

    Returns:
        {
          "label": "AI Generated" | "Human Generated",
          "ai_probability": float (0-100),
          "human_probability": float (0-100),
          "highlighted_sentences": [
              {"sentence": str, "ai_probability": float, "is_ai": bool}, ...
          ]
        }
    """
    pipeline = load_model()

    # ── Overall prediction ────────────────────────────────────────────────────
    ai_prob, human_prob = _predict_proba(pipeline, text)
    label = "AI Generated" if ai_prob >= 0.5 else "Human Generated"

    # ── Sentence-level highlighting ───────────────────────────────────────────
    sentences = sent_tokenize(text)
    highlighted = []
    for sentence in sentences:
        clean = sentence.strip()
        if not clean:
            continue
        s_ai, _ = _predict_proba(pipeline, clean)
        highlighted.append({
            "sentence": clean,
            "ai_probability": round(s_ai * 100, 2),
            "is_ai": s_ai > 0.6,  # threshold for highlighting
        })

    return {
        "label": label,
        "ai_probability": round(ai_prob * 100, 2),
        "human_probability": round(human_prob * 100, 2),
        "highlighted_sentences": highlighted,
    }
