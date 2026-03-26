"""
Train a TF-IDF + Logistic Regression pipeline for AI-vs-Human text classification.

Uses a synthetic dataset that captures stylistic differences:
  • AI text  → formal, structured, polished, uses transition words
  • Human text → casual, varied, sometimes imperfect

Run once:  python train_model.py
Output:    model/ai_detector_pipeline.pkl
"""

import os
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import cross_val_score

# ── Synthetic Training Data ──────────────────────────────────────────────────
# More data → better generalisation; feel free to extend.

AI_TEXTS = [
    "Artificial intelligence has revolutionized the way we approach complex problems. Through sophisticated algorithms and machine learning techniques, AI systems can now process vast amounts of data with unprecedented accuracy and efficiency.",
    "The implementation of neural networks has significantly enhanced our ability to recognize patterns in large datasets. Furthermore, deep learning architectures have demonstrated remarkable capabilities in natural language processing tasks.",
    "In conclusion, the systematic analysis of the presented data reveals several key insights. First, the correlation between variables X and Y demonstrates a statistically significant relationship. Second, the regression model provides strong predictive capabilities.",
    "The methodology employed in this research follows a structured approach to data collection and analysis. By utilizing quantitative methods, we can ensure the reliability and validity of our findings.",
    "Machine learning algorithms have demonstrated exceptional performance across various domains. The integration of these technologies into existing systems has resulted in substantial improvements in operational efficiency.",
    "This comprehensive analysis examines the multifaceted aspects of climate change and its implications for global sustainability. The evidence suggests that immediate action is necessary to mitigate the adverse effects.",
    "The advancement of natural language processing has enabled machines to understand and generate human-like text with remarkable fluency. These developments have significant implications for automated content creation.",
    "Furthermore, the utilization of advanced computational techniques has facilitated the development of more sophisticated predictive models. These models demonstrate superior accuracy when compared to traditional statistical approaches.",
    "The intersection of technology and education has created numerous opportunities for personalized learning experiences. Adaptive learning platforms leverage artificial intelligence to tailor educational content to individual student needs.",
    "In summary, the evidence presented throughout this analysis supports the hypothesis that technological innovation drives economic growth. The correlation between research and development investment and GDP growth is well-documented.",
    "The proliferation of digital technologies has fundamentally transformed the landscape of modern communication. Social media platforms have emerged as powerful tools for disseminating information and facilitating global discourse.",
    "Quantum computing represents a paradigm shift in computational capabilities. By leveraging quantum mechanical phenomena such as superposition and entanglement, these systems can solve problems that are intractable for classical computers.",
    "The systematic review of literature reveals a consensus among researchers regarding the efficacy of machine learning approaches in medical diagnostics. These methodologies have shown promising results in early disease detection.",
    "Blockchain technology has introduced a decentralized framework for secure and transparent transactions. The immutable nature of blockchain records ensures data integrity and reduces the risk of fraudulent activities.",
    "The development of autonomous vehicles represents a significant milestone in the evolution of transportation technology. These systems integrate multiple sensor modalities and sophisticated decision-making algorithms to navigate complex environments.",
    "It is important to note that the findings of this study should be interpreted within the context of its methodological limitations. Nevertheless, the results provide valuable insights into the phenomenon under investigation.",
    "The optimization of supply chain operations through artificial intelligence has resulted in measurable improvements in cost efficiency and resource allocation. Predictive analytics enables proactive decision-making in logistics management.",
    "The ethical implications of artificial intelligence deployment in healthcare settings warrant careful consideration. Balancing technological capabilities with patient privacy and algorithmic fairness remains a critical challenge.",
    "Moreover, the implementation of renewable energy technologies has demonstrated significant potential for reducing carbon emissions. Solar and wind power generation have become increasingly cost-competitive with traditional fossil fuel sources.",
    "The integration of Internet of Things devices into smart home ecosystems has created unprecedented opportunities for energy management and home automation. These interconnected systems enable real-time monitoring and control.",
    "According to recent studies, the application of deep learning techniques in image recognition has achieved human-level performance in several benchmark tasks. Convolutional neural networks have proven particularly effective in this domain.",
    "The comprehensive evaluation of educational technology tools reveals varying degrees of effectiveness across different learning contexts. Factors such as user interface design, content quality, and pedagogical alignment significantly influence outcomes.",
    "The emergence of large language models has fundamentally altered the landscape of text generation. These models, trained on extensive corpora, can produce coherent and contextually appropriate text across diverse topics.",
    "Data privacy regulations such as GDPR have necessitated significant changes in how organizations collect, process, and store personal information. Compliance with these regulations requires robust data governance frameworks.",
    "The convergence of artificial intelligence and biotechnology has opened new frontiers in drug discovery and development. Machine learning models can predict molecular interactions and identify potential therapeutic candidates.",
]

HUMAN_TEXTS = [
    "I think AI is pretty cool but honestly sometimes it freaks me out a bit. Like when my phone knows what I'm about to type, that's kind of weird right?",
    "So yesterday I was trying to fix my code and spent like 3 hours debugging only to find out I had a typo in a variable name. Programming is fun they said lol.",
    "My dog ate my homework. No seriously, he actually chewed up my notebook. Gotta love pets! Anyway here's what I remember from the assignment.",
    "I'm not gonna lie, I didn't really understand the lecture today. The professor was talking about quantum mechanics and I was just sitting there nodding pretending I got it.",
    "The coffee shop down the street makes the best lattes. I go there every morning before class. It's become kind of a routine for me and honestly I don't know how I'd survive without caffeine.",
    "Okay so here's the thing about climate change - we all know it's bad but getting people to actually do something about it is really hard, you know?",
    "I was reading this article about space exploration and wow, did you know they found water on Mars? That's insane! Makes you wonder what else is out there.",
    "Had the worst exam today. I studied all night but half the questions were on stuff the professor barely covered in class. Super frustrating honestly.",
    "My roommate keeps leaving dishes in the sink and it's driving me crazy. I've told him like five times already. Living with other people is hard sometimes.",
    "Just finished watching this documentary about the ocean. There are creatures down there that look like actual aliens. Nature is wild, man.",
    "I tried cooking dinner last night and basically burned everything. Maybe I should stick to cereal haha. But seriously I need to learn how to cook real food eventually.",
    "The weather has been so weird lately. One day it's sunny and warm, next day it's freezing cold. I never know what to wear anymore.",
    "Went hiking over the weekend with some friends. It was exhausting but the view from the top was totally worth it. Sometimes you just gotta get outside.",
    "My grandma still doesn't understand how to use her phone properly. She called me three times by accident yesterday. It's actually kinda cute though.",
    "I really need to start working out again. I've been saying this for months but Netflix keeps winning. Tomorrow for sure. Maybe.",
    "So my car broke down on the highway last week and I had to wait 2 hours for a tow truck. Not exactly how I planned to spend my Friday night.",
    "Honestly, this whole online learning thing has its pros and cons. I like not having to commute but I miss actually seeing people face to face.",
    "The new pizza place in town is amazing! Their crust is super thin and crispy. We ordered way too much food but zero regrets.",
    "I keep forgetting to water my plants and they're starting to look really sad. I should probably set a reminder or something.",
    "Math has never been my strong suit. Like I can do basic stuff fine but once you throw in calculus I'm completely lost. Why do we even need this?",
    "Spent the whole weekend binge watching a show on Netflix. I know I should have been studying but the show was just too good to stop.",
    "My little sister drew me a picture today and honestly its the cutest thing ever. She drew us holding hands with a rainbow in the background.",
    "I cant believe how expensive textbooks are. Like seriously, $200 for a book I'll use for one semester? There has to be a better way.",
    "Traffic was absolutely terrible this morning. What normally takes 20 minutes took over an hour. I was so late for my meeting.",
    "Tried a new recipe from YouTube today and it actually turned out pretty good! Think I'm getting better at this whole cooking thing.",
]

# ── Training ─────────────────────────────────────────────────────────────────

def train_and_save():
    texts = AI_TEXTS + HUMAN_TEXTS
    labels = ["ai"] * len(AI_TEXTS) + ["human"] * len(HUMAN_TEXTS)

    # Build pipeline: TF-IDF vectorisation → Logistic Regression
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),      # unigrams + bigrams
            stop_words="english",
            min_df=1,
            sublinear_tf=True,       # apply log scaling
        )),
        ("clf", LogisticRegression(
            max_iter=1000,
            C=1.0,
            class_weight="balanced",
            random_state=42,
        )),
    ])

    # Cross-validate for a quick accuracy check
    scores = cross_val_score(pipeline, texts, labels, cv=3, scoring="accuracy")
    print(f"Cross-validation accuracy: {np.mean(scores):.2%} (+/- {np.std(scores):.2%})")

    # Fit on full dataset
    pipeline.fit(texts, labels)

    # Save model
    model_dir = os.path.join(os.path.dirname(__file__), "model")
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "ai_detector_pipeline.pkl")
    joblib.dump(pipeline, model_path)
    print(f"Model saved to {model_path}")

    # Quick test
    test_text = "The implementation of advanced algorithms has significantly improved system performance."
    probs = pipeline.predict_proba([test_text])[0]
    classes = list(pipeline.classes_)
    print(f"\nTest: '{test_text}'")
    print(f"  AI probability:    {probs[classes.index('ai')]:.2%}")
    print(f"  Human probability: {probs[classes.index('human')]:.2%}")


if __name__ == "__main__":
    train_and_save()
