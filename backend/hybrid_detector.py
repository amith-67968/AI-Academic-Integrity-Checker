"""
Hybrid AI Text Detector — Ensemble of TF-IDF + RoBERTa Transformer
====================================================================

Combines the existing TF-IDF + Logistic Regression pipeline with a
pretrained RoBERTa-based AI detector for more accurate classification.

Models:
  1. TF-IDF + Logistic Regression  (local, fast, style-based features)
  2. RoBERTa transformer           (openai-community/roberta-base-openai-detector)

The final prediction is a weighted average of both models' probabilities.

Features:
  - Graceful fallback: if the transformer fails, TF-IDF alone is used.
  - Long-text chunking: texts exceeding 512 tokens are split into
    overlapping chunks and probabilities are averaged.
  - Feature engineering: standalone text features (sentence length,
    punctuation density, vocabulary richness, etc.) are included in
    model_details for transparency.

Usage:
  from hybrid_detector import hybrid_predict, load_all_models
  load_all_models()                   # call once at startup
  result = hybrid_predict("Some text to analyze")
"""

import os
import re
import logging
import joblib  # type: ignore
import numpy as np  # type: ignore
import torch  # type: ignore
from transformers import AutoTokenizer, AutoModelForSequenceClassification  # type: ignore

# Import custom transformer class so joblib can deserialize the TF-IDF pipeline
from train_model import StyleFeatureExtractor  # type: ignore  # noqa: F401

logger = logging.getLogger(__name__)

# ── Paths ────────────────────────────────────────────────────────────────────
MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
TFIDF_MODEL_PATH = os.path.join(MODEL_DIR, "ai_detector_pipeline.pkl")

# Pretrained transformer model identifier (downloaded from HuggingFace)
TRANSFORMER_MODEL_NAME = "openai-community/roberta-base-openai-detector"

# ── Ensemble weights ─────────────────────────────────────────────────────────
# Transformer gets higher weight because it generalises better.
# TF-IDF still contributes complementary stylistic signals.
TFIDF_WEIGHT = 0.3
TRANSFORMER_WEIGHT = 0.7

# ── Chunking parameters for long texts ───────────────────────────────────────
# RoBERTa has a maximum context window of 512 tokens.
# For long texts we split into overlapping chunks and average probabilities.
MAX_TOKENS = 512          # max tokens per chunk
CHUNK_OVERLAP_TOKENS = 64 # overlap between consecutive chunks

# ── Global model references (loaded once) ────────────────────────────────────
_tfidf_pipeline = None
_tokenizer = None
_transformer_model = None
_device = None


# ═══════════════════════════════════════════════════════════════════════════════
# Model Loading
# ═══════════════════════════════════════════════════════════════════════════════

def load_tfidf_model():
    """Load the trained TF-IDF + Logistic Regression pipeline from disk."""
    global _tfidf_pipeline
    if _tfidf_pipeline is None:
        if not os.path.exists(TFIDF_MODEL_PATH):
            raise FileNotFoundError(
                f"TF-IDF model not found at {TFIDF_MODEL_PATH}. "
                "Run `python train_model.py` first."
            )
        _tfidf_pipeline = joblib.load(TFIDF_MODEL_PATH)
        logger.info("✅ TF-IDF pipeline loaded")
    return _tfidf_pipeline


def load_transformer_model():
    """
    Load the pretrained RoBERTa-based AI detector from HuggingFace.

    Downloads the model on first run (~500 MB) and caches it in
    ~/.cache/huggingface for subsequent runs.
    Uses GPU if available, otherwise falls back to CPU.
    """
    global _tokenizer, _transformer_model, _device

    if _transformer_model is None:
        logger.info(f"Loading transformer model: {TRANSFORMER_MODEL_NAME} ...")

        # Select device: GPU if available, otherwise CPU
        _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Using device: {_device}")

        # Load tokenizer and model
        _tokenizer = AutoTokenizer.from_pretrained(TRANSFORMER_MODEL_NAME)
        _transformer_model = AutoModelForSequenceClassification.from_pretrained(
            TRANSFORMER_MODEL_NAME
        )
        # Move model to device and set to evaluation mode
        _transformer_model.to(_device)
        _transformer_model.eval()

        logger.info("✅ Transformer model loaded")

    return _tokenizer, _transformer_model, _device


def load_all_models():
    """
    Pre-load both models. Call this once at application startup
    to avoid cold-start latency on the first request.
    """
    load_tfidf_model()
    try:
        load_transformer_model()
    except Exception as e:
        # Transformer is non-critical — log and continue with TF-IDF only
        logger.warning(f"⚠️  Transformer model could not be loaded: {e}")
        logger.warning("   System will operate in TF-IDF-only mode.")
    logger.info("✅ All models ready")


# ═══════════════════════════════════════════════════════════════════════════════
# Feature Engineering — standalone text features
# ═══════════════════════════════════════════════════════════════════════════════

def compute_text_features(text: str) -> dict:
    """
    Extract simple, interpretable features from the input text.

    These features are NOT used for prediction (both models already
    handle feature extraction internally), but they are returned in
    model_details for transparency and can be useful for downstream
    rule-based overrides or debugging.

    Returns a dict with:
      - avg_sentence_length : average number of words per sentence
      - sentence_count      : total number of sentences
      - word_count          : total number of words
      - punctuation_density : punctuation characters per word
      - contraction_rate    : contractions per sentence
      - vocabulary_richness : type-token ratio (unique words / total words)
      - avg_word_length     : average character length of words
    """
    # Split into sentences and words
    sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
    words = text.split()
    num_words = max(len(words), 1)
    num_sentences = max(len(sentences), 1)

    # Average sentence length (words per sentence)
    avg_sentence_length = float(num_words / num_sentences)

    # Punctuation density (punctuation chars per word)
    punctuation_chars = sum(1 for ch in text if ch in ".,;:!?\"'()-—…")
    punctuation_density = float(punctuation_chars / num_words)

    # Contraction rate (contractions per sentence)
    contractions = len(re.findall(
        r"\b(?:i'm|i've|i'll|i'd|we're|we've|we'll|we'd|they're|they've|"
        r"they'll|they'd|you're|you've|you'll|you'd|he's|she's|it's|"
        r"isn't|aren't|wasn't|weren't|don't|doesn't|didn't|won't|wouldn't|"
        r"can't|couldn't|shouldn't|hasn't|haven't|hadn't|"
        r"that's|there's|here's|what's|who's|let's|"
        r"gonna|gotta|wanna|kinda|sorta|dunno)\b",
        text.lower()
    ))
    contraction_rate = float(contractions / num_sentences)

    # Vocabulary richness (type-token ratio)
    unique_words = set(w.lower() for w in words)
    vocabulary_richness = float(len(unique_words) / num_words)

    # Average word length
    avg_word_length = float(sum(len(w) for w in words) / num_words)

    return {
        "avg_sentence_length": avg_sentence_length,
        "sentence_count": num_sentences,
        "word_count": num_words,
        "punctuation_density": punctuation_density,
        "contraction_rate": contraction_rate,
        "vocabulary_richness": vocabulary_richness,
        "avg_word_length": avg_word_length,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# Individual Model Predictions
# ═══════════════════════════════════════════════════════════════════════════════

def predict_tfidf(text: str) -> tuple[float, float]:
    """
    Run the TF-IDF + Logistic Regression pipeline on the input text.

    Returns:
        (ai_probability, human_probability) as floats in [0, 1].
    """
    pipeline = load_tfidf_model()
    probs = pipeline.predict_proba([text])[0]

    # Map class indices to labels
    classes = list(pipeline.classes_)
    ai_idx = classes.index("ai")
    human_idx = classes.index("human")

    return float(probs[ai_idx]), float(probs[human_idx])


def predict_transformer(text: str) -> tuple[float, float]:
    """
    Run the pretrained RoBERTa AI detector on the input text.

    For texts longer than 512 tokens, splits into overlapping chunks
    and averages the probabilities across chunks.

    The model outputs two logits: [Real/Human, Fake/AI].
    We apply softmax to get probabilities.

    Returns:
        (ai_probability, human_probability) as floats in [0, 1].
    """
    tokenizer, model, device = load_transformer_model()

    # Type guard for Pyright
    assert tokenizer is not None
    assert model is not None

    # ── Tokenize to check length ─────────────────────────────────────────
    token_ids = tokenizer.encode(text, add_special_tokens=False)

    # ── Build chunks (overlapping windows if text exceeds MAX_TOKENS) ────
    # We leave 2 tokens for [CLS] and [SEP] special tokens
    usable_length = MAX_TOKENS - 2
    stride = usable_length - CHUNK_OVERLAP_TOKENS

    if len(token_ids) <= usable_length:
        # Short text — single pass
        chunks = [token_ids]
    else:
        # Long text — slide a window across the tokens
        chunks = []
        for start in range(0, len(token_ids), stride):
            chunk = token_ids[start : start + usable_length]
            chunks.append(chunk)
            if start + usable_length >= len(token_ids):
                break  # last chunk captured the end

    # ── Run inference on each chunk ──────────────────────────────────────
    all_ai_probs = []
    all_human_probs = []

    for chunk_ids in chunks:
        # Manually build input_ids with special tokens
        input_ids = [tokenizer.cls_token_id] + chunk_ids + [tokenizer.sep_token_id]
        attention_mask = [1] * len(input_ids)

        inputs = {
            "input_ids": torch.tensor([input_ids], device=device),
            "attention_mask": torch.tensor([attention_mask], device=device),
        }

        # Run inference without computing gradients (faster, less memory)
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits

        # Apply softmax to get probabilities
        # Model labels: {0: "Fake" (AI), 1: "Real" (Human)}
        probs = torch.softmax(logits, dim=-1)[0].cpu().numpy()
        all_ai_probs.append(float(probs[0]))
        all_human_probs.append(float(probs[1]))

    # ── Average probabilities across chunks ──────────────────────────────
    ai_prob = float(np.mean(all_ai_probs))
    human_prob = float(np.mean(all_human_probs))

    return ai_prob, human_prob


# ═══════════════════════════════════════════════════════════════════════════════
# Hybrid Ensemble Prediction
# ═══════════════════════════════════════════════════════════════════════════════

def hybrid_predict(
    text: str,
    tfidf_weight: float = TFIDF_WEIGHT,
    transformer_weight: float = TRANSFORMER_WEIGHT,
) -> dict:
    """
    Run both models and combine their predictions via weighted average.

    If the transformer model is unavailable or errors during inference,
    the system gracefully falls back to TF-IDF-only prediction.

    Args:
        text:               The text to classify.
        tfidf_weight:       Weight for the TF-IDF model (default 0.3).
        transformer_weight: Weight for the transformer model (default 0.7).

    Returns:
        {
            "prediction":          "AI Generated" | "Human Generated",
            "confidence":          float (0–100),
            "ai_probability":      float (0–100),
            "human_probability":   float (0–100),
            "model_details": {
                "tfidf":       {"ai": float, "human": float, "weight": float},
                "transformer": {"ai": float, "human": float, "weight": float},
                "text_features": { ... },
                "fallback_mode": bool,
            }
        }
    """
    # ── Step 1: Get TF-IDF prediction (always available) ─────────────────
    tfidf_ai, tfidf_human = predict_tfidf(text)

    # ── Step 2: Try transformer prediction (graceful fallback) ───────────
    fallback_mode = False
    try:
        trans_ai, trans_human = predict_transformer(text)
    except Exception as e:
        # Transformer failed — fall back to TF-IDF only
        logger.warning(f"⚠️  Transformer prediction failed: {e}")
        logger.warning("   Falling back to TF-IDF-only prediction.")
        trans_ai, trans_human = 0.0, 0.0
        transformer_weight = 0.0  # zero out transformer contribution
        tfidf_weight = 1.0        # TF-IDF takes full weight
        fallback_mode = True

    # ── Step 3: Weighted average ensemble ─────────────────────────────────
    # Normalise weights in case they don't sum to 1
    total_weight = tfidf_weight + transformer_weight
    if total_weight == 0:
        total_weight = 1.0  # safety guard
    w_tfidf = tfidf_weight / total_weight
    w_trans = transformer_weight / total_weight

    ensemble_ai = (w_tfidf * tfidf_ai) + (w_trans * trans_ai)
    ensemble_human = (w_tfidf * tfidf_human) + (w_trans * trans_human)

    # ── Step 4: Final decision ────────────────────────────────────────────
    if ensemble_ai >= 0.5:
        prediction = "AI Generated"
        confidence = ensemble_ai * 100
    else:
        prediction = "Human Generated"
        confidence = ensemble_human * 100

    # ── Step 5: Compute text features for transparency ───────────────────
    text_features = compute_text_features(text)

    return {
        "prediction": prediction,
        "confidence": float(f"{confidence:.2f}"),
        "ai_probability": float(f"{ensemble_ai * 100:.2f}"),
        "human_probability": float(f"{ensemble_human * 100:.2f}"),
        "model_details": {
            "tfidf": {
                "ai": float(f"{tfidf_ai * 100:.2f}"),
                "human": float(f"{tfidf_human * 100:.2f}"),
                "weight": w_tfidf,
            },
            "transformer": {
                "ai": float(f"{trans_ai * 100:.2f}"),
                "human": float(f"{trans_human * 100:.2f}"),
                "weight": w_trans,
            },
            "text_features": text_features,
            "fallback_mode": fallback_mode,
        },
    }


# ═══════════════════════════════════════════════════════════════════════════════
# Quick Self-Test
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    print("Loading models...")
    load_all_models()

    test_texts = [
        (
            "The implementation of advanced algorithms has significantly improved "
            "system performance. Furthermore, the integration of machine learning "
            "techniques has demonstrated remarkable potential for optimization.",
            "AI",
        ),
        (
            "I cant believe how expensive textbooks are. Like seriously, $200 for "
            "a book I'll use for one semester? There has to be a better way.",
            "Human",
        ),
        (
            "Global warming is a serious threat to our planet. The earth's temperature "
            "has been rising steadily due to greenhouse gas emissions. We need to take "
            "action now before its too late for future generations.",
            "Human",
        ),
    ]

    print("\n" + "=" * 70)
    print("HYBRID MODEL — TEST PREDICTIONS")
    print("=" * 70)

    for text, expected in test_texts:
        result = hybrid_predict(text)
        status = "✅" if expected in result["prediction"] else "❌"
        print(f"\n{status} Expected: {expected} | Predicted: {result['prediction']}")
        print(f"   Confidence: {float(result['confidence']):.1f}%")
        print(f"   AI: {float(result['ai_probability']):.1f}% | Human: {float(result['human_probability']):.1f}%")
        details = result["model_details"]
        print(f"   ├─ TF-IDF      → AI: {float(details['tfidf']['ai']):.1f}%  Human: {float(details['tfidf']['human']):.1f}%  (weight: {float(details['tfidf']['weight']):.0%})")
        print(f"   ├─ Transformer  → AI: {float(details['transformer']['ai']):.1f}%  Human: {float(details['transformer']['human']):.1f}%  (weight: {float(details['transformer']['weight']):.0%})")
        features = details["text_features"]
        print(f"   └─ Features     → words: {features['word_count']}, "
              f"avg_sent_len: {features['avg_sentence_length']}, "
              f"vocab_richness: {features['vocabulary_richness']}, "
              f"contractions: {features['contraction_rate']}")
        if bool(details.get("fallback_mode")):
            print("   [WARNING] FALLBACK MODE: Transformer was unavailable")
