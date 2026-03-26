"""
ML Module — Hybrid AI Text Detection (TF-IDF + Transformer Ensemble)
=====================================================================

Functions:
  load_model()          → loads both TF-IDF pipeline and transformer model
  analyze_text(text)    → returns label, probabilities, highlighted sentences

This module wraps hybrid_detector.py and provides the same interface
that app.py expects, so the API layer doesn't need to change.
"""

import os
import logging
import joblib  # type: ignore
import nltk  # type: ignore

# Import custom transformer so joblib can deserialize the TF-IDF pipeline
from train_model import StyleFeatureExtractor  # type: ignore  # noqa: F401

# Import hybrid detector (TF-IDF + RoBERTa ensemble)
from hybrid_detector import (  # type: ignore
    load_all_models,
    hybrid_predict,
)

logger = logging.getLogger(__name__)

# Download punkt tokenizer data (needed for sentence splitting)
try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    nltk.download('punkt_tab', quiet=True)

from nltk.tokenize import sent_tokenize  # type: ignore

# ── Global flag ──────────────────────────────────────────────────────────────
_models_loaded = False


def load_model():
    """
    Load both the TF-IDF pipeline and the RoBERTa transformer model.

    Safe to call multiple times — models are only loaded once.
    """
    global _models_loaded
    if not _models_loaded:
        load_all_models()
        _models_loaded = True
    return True


def analyze_text(text: str) -> dict:
    """
    Analyse the submitted text using the hybrid ensemble (TF-IDF + Transformer).

    Returns:
        {
          "label":                  "AI Generated" | "Human Generated",
          "ai_probability":         float (0–100),
          "human_probability":      float (0–100),
          "confidence":             float (0–100),
          "model_details":          { tfidf: {...}, transformer: {...} },
          "highlighted_sentences":  [
              {"sentence": str, "ai_probability": float, "is_ai": bool}, ...
          ]
        }
    """
    # Ensure models are loaded
    load_model()

    # ── Overall prediction (hybrid ensemble) ──────────────────────────────
    result = hybrid_predict(text)

    label = result["prediction"]
    ai_prob = result["ai_probability"]
    human_prob = result["human_probability"]
    confidence = result["confidence"]

    # ── Sentence-level highlighting ───────────────────────────────────────
    sentences = sent_tokenize(text)
    highlighted = []
    for sentence in sentences:
        clean = sentence.strip()
        if not clean:
            continue
        # Use hybrid predictor for each sentence too
        s_result = hybrid_predict(clean)
        s_ai = s_result["ai_probability"]
        highlighted.append({
            "sentence": clean,
            "ai_probability": round(s_ai, 2),
            "is_ai": s_ai > 60.0,  # threshold for highlighting (60%)
        })

    return {
        "label": label,
        "ai_probability": round(ai_prob, 2),
        "human_probability": round(human_prob, 2),
        "confidence": round(confidence, 2),
        "model_details": result["model_details"],
        "highlighted_sentences": highlighted,
    }
