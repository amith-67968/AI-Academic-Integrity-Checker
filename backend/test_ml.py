"""Quick ML logic verification script."""
import sys
sys.path.insert(0, '.')

from train_model import StyleFeatureExtractor  # noqa: F401
from ml_model import load_model, analyze_text

print("Loading models...")
load_model()
print("Models loaded!\n")

# Test cases
tests = [
    (
        "The implementation of advanced algorithms has significantly improved "
        "system performance. Furthermore, the integration of machine learning "
        "techniques has demonstrated remarkable potential for optimization.",
        "AI"
    ),
    (
        "I cant believe how expensive textbooks are. Like seriously, $200 for a "
        "book I'll use for one semester? There has to be a better way.",
        "Human"
    ),
    (
        "Global warming is a serious threat to our planet. The earth's temperature "
        "has been rising steadily due to greenhouse gas emissions. We need to take "
        "action now before its too late for future generations.",
        "Human"
    ),
    (
        "The comprehensive evaluation of artificial intelligence systems reveals "
        "several critical considerations. First, algorithmic transparency is essential "
        "for building trust. Second, data quality directly impacts model performance.",
        "AI"
    ),
    (
        "Pollution is a big problem in our cities. The air quality keeps getting worse "
        "because of vehicles and factories. People are getting sick more often and the "
        "government needs to do something about it.",
        "Human"
    ),
]

print("=" * 70)
print("ML LOGIC VERIFICATION")
print("=" * 70)

passed = 0
total = len(tests)

for text, expected in tests:
    result = analyze_text(text)
    label = result["label"]
    ai_prob = result["ai_probability"]
    human_prob = result["human_probability"]
    
    predicted = "AI" if "AI" in label else "Human"
    is_correct = predicted == expected
    status = "PASS" if is_correct else "FAIL"
    if is_correct:
        passed += 1
    
    print(f"\n[{status}] Expected: {expected} | Got: {predicted}")
    print(f"  AI: {ai_prob}% | Human: {human_prob}%")
    print(f"  Sentences highlighted: {len(result['highlighted_sentences'])}")
    for s in result["highlighted_sentences"]:
        flag = "AI" if s["is_ai"] else "OK"
        print(f"    [{flag}] ({s['ai_probability']}%) {s['sentence'][:70]}...")

print(f"\n{'=' * 70}")
print(f"RESULTS: {passed}/{total} tests passed")
print(f"{'=' * 70}")

# Check model_details structure
print("\n--- Model Details Structure Check ---")
result = analyze_text("Test text for structure check.")
details = result.get("model_details", {})
print(f"  Has tfidf:          {'tfidf' in details}")
print(f"  Has transformer:    {'transformer' in details}")
print(f"  Has text_features:  {'text_features' in details}")
print(f"  Fallback mode:      {details.get('fallback_mode', 'N/A')}")
print(f"  TF-IDF weight:      {details.get('tfidf', {}).get('weight', 'N/A')}")
print(f"  Transformer weight: {details.get('transformer', {}).get('weight', 'N/A')}")
print("\nAll checks complete!")
