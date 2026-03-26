"""
Train a TF-IDF + Logistic Regression pipeline for AI-vs-Human text classification.

Uses a synthetic dataset that captures stylistic differences:
  • AI text  → formal, structured, polished, uses transition words
  • Human text → casual, varied, sometimes imperfect

Run once:  python train_model.py
Output:    model/ai_detector_pipeline.pkl
"""

import os
import joblib  # type: ignore
import numpy as np  # type: ignore
from sklearn.feature_extraction.text import TfidfVectorizer  # type: ignore
from sklearn.linear_model import LogisticRegression  # type: ignore
from sklearn.pipeline import Pipeline  # type: ignore
from sklearn.model_selection import cross_val_score  # type: ignore

# ── Synthetic Training Data ──────────────────────────────────────────────────
# More data → better generalisation; feel free to extend.

AI_TEXTS = [
    # --- Original 25 ---
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
    # --- New: Academic / essay style ---
    "The socioeconomic ramifications of automation necessitate a comprehensive reevaluation of existing labor market policies. As artificial intelligence systems assume an increasingly prominent role in various industries, the displacement of human workers presents significant challenges.",
    "Photosynthesis is a fundamental biological process that converts light energy into chemical energy. This process occurs primarily in the chloroplasts of plant cells and is essential for sustaining life on Earth.",
    "The French Revolution of 1789 marked a pivotal turning point in European history. The subsequent sociopolitical transformations fundamentally altered the structure of governance and established the foundations for modern democratic institutions.",
    "Climate models consistently project that global mean surface temperatures will continue to rise throughout the twenty-first century. The magnitude of this increase is contingent upon the trajectory of greenhouse gas emissions.",
    "The human cardiovascular system is a complex network of blood vessels, including arteries, veins, and capillaries, that facilitates the transportation of oxygen and nutrients to tissues throughout the body.",
    "Contemporary educational paradigms emphasize the importance of critical thinking and problem-solving skills. These competencies are considered essential for navigating the complexities of the modern knowledge economy.",
    "The Industrial Revolution brought about unprecedented changes in manufacturing processes, transitioning from manual labor to mechanized production. This transformation had profound implications for economic structures and social hierarchies.",
    "Neuroscientific research has demonstrated that the human brain exhibits remarkable plasticity throughout the lifespan. This capacity for structural and functional adaptation underlies learning, memory formation, and recovery from injury.",
    "The principles of thermodynamics govern the behavior of energy in physical systems. The first law establishes the conservation of energy, while the second law introduces the concept of entropy and the directionality of natural processes.",
    "Global supply chains have become increasingly interconnected, creating both opportunities and vulnerabilities. The COVID-19 pandemic exposed the fragility of these networks and highlighted the need for greater resilience and diversification.",
    # --- New: Formal / polished style ---
    "Effective communication is a cornerstone of organizational success. By fostering transparent and consistent information flow, organizations can enhance collaboration, minimize misunderstandings, and achieve strategic objectives more efficiently.",
    "The analysis of big data has become an indispensable tool for modern businesses. By leveraging advanced analytics and machine learning algorithms, companies can extract actionable insights from vast datasets to inform strategic decision-making.",
    "Sustainable development requires a balanced approach that addresses economic growth, social equity, and environmental protection simultaneously. Achieving this balance necessitates collaborative efforts from governments, businesses, and civil society.",
    "The role of artificial intelligence in cybersecurity has become increasingly critical as threats grow in sophistication and frequency. AI-powered systems can detect anomalies, identify vulnerabilities, and respond to incidents in real time.",
    "Digital transformation has become imperative for organizations seeking to remain competitive in rapidly evolving markets. The adoption of cloud computing, automation, and data-driven strategies enables greater agility and operational efficiency.",
    "The field of genomics has experienced transformative advancements due to improvements in sequencing technologies. These developments have facilitated personalized medicine approaches and enhanced our understanding of genetic contributions to disease.",
    "Urban planning in the twenty-first century must contend with the dual challenges of population growth and environmental sustainability. Smart city initiatives leverage technology to optimize resource utilization and improve quality of life.",
    "The application of machine learning in financial services has yielded significant improvements in risk assessment, fraud detection, and algorithmic trading. These technologies enable more accurate predictions and faster decision-making processes.",
    "Water scarcity represents one of the most pressing environmental challenges of our time. The development of innovative desalination and water recycling technologies is essential for ensuring access to clean water for growing populations.",
    "The philosophical implications of artificial general intelligence raise fundamental questions about consciousness, autonomy, and the nature of intelligence itself. These considerations have important ramifications for policy development and ethical governance.",
    # --- New: Report / summary style ---
    "This report presents a comprehensive overview of the current state of renewable energy adoption worldwide. The findings indicate a consistent upward trend in both capacity installations and cost reductions across major renewable technologies.",
    "The results of this experiment demonstrate a statistically significant correlation between the independent and dependent variables. The p-value of 0.003 indicates that the observed relationship is unlikely to have occurred by chance.",
    "In light of the aforementioned considerations, it is recommended that organizations adopt a phased approach to digital transformation. This strategy allows for iterative adaptation and minimizes the risk of disruption to existing operations.",
    "The literature review reveals that prior research has produced mixed results regarding the effectiveness of remote work arrangements. While some studies report increased productivity, others highlight challenges related to communication and collaboration.",
    "Based on our analysis, we can conclude that the implementation of automated quality control systems has resulted in a measurable reduction in defect rates. The data supports the hypothesis that automation improves manufacturing precision.",
    # --- New: AI-generated essay patterns ---
    "There are several key factors that contribute to the success of educational technology implementation. First, adequate teacher training is essential. Second, the technology must align with pedagogical objectives. Third, ongoing support must be provided.",
    "The impact of social media on mental health has been the subject of extensive research in recent years. Studies have consistently demonstrated associations between excessive social media usage and increased rates of anxiety and depression among young adults.",
    "Cybersecurity threats continue to evolve in complexity and scale, necessitating the development of more sophisticated defensive measures. Organizations must adopt a multi-layered security approach that encompasses both technological solutions and human awareness training.",
    "The transition to a circular economy model represents a fundamental shift in how societies conceptualize production and consumption. By emphasizing reuse, recycling, and resource recovery, this model aims to minimize waste and maximize resource efficiency.",
    "Telemedicine has emerged as a transformative force in healthcare delivery, particularly in the wake of the COVID-19 pandemic. This technology enables patients to receive medical consultations remotely, thereby improving access to care and reducing unnecessary hospital visits.",
    "The significance of biodiversity conservation cannot be overstated. Ecosystems with high biodiversity demonstrate greater resilience to environmental disturbances and provide essential services such as pollination, water purification, and carbon sequestration.",
    "Advancements in robotics and automation have profoundly impacted the manufacturing sector. The deployment of collaborative robots, or cobots, has enabled more flexible production processes while maintaining high standards of safety and efficiency.",
    "Space exploration continues to yield valuable scientific discoveries that enhance our understanding of the universe. Recent missions to Mars have provided crucial data regarding the planet's geological history and the potential for past microbial life.",
    "The development of 5G telecommunications networks promises to deliver significantly faster data transmission speeds and lower latency. These improvements will enable a wide range of applications, including autonomous vehicles, remote surgery, and augmented reality.",
    "Artificial neural networks have demonstrated remarkable capabilities in pattern recognition tasks across multiple domains. The architecture of these networks, inspired by biological neural systems, enables hierarchical feature extraction and representation learning.",
    "The global education system faces unprecedented challenges in adapting to the rapid pace of technological change. Curriculum reform and the integration of digital literacy skills are essential for preparing students for the workforce of the future.",
    "Environmental sustainability has become a central concern for businesses across all sectors. Corporate social responsibility initiatives increasingly focus on reducing carbon footprints, implementing sustainable supply chain practices, and promoting ecological stewardship.",
    "The democratization of information through the internet has had profound implications for journalism, education, and public discourse. While increased access to information empowers individuals, it also presents challenges related to misinformation and digital literacy.",
    "Edge computing represents an emerging paradigm that brings computational resources closer to the point of data generation. This approach reduces latency, conserves bandwidth, and enables real-time processing for applications such as autonomous systems and IoT devices.",
    "The field of materials science has witnessed groundbreaking developments in the creation of novel materials with extraordinary properties. Graphene, carbon nanotubes, and metamaterials offer potential applications ranging from electronics to aerospace engineering.",
]

HUMAN_TEXTS = [
    # --- Original 25 ---
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
    # --- New: Casual / conversational ---
    "Dude the wifi in the library is SO slow today. I've been trying to submit my assignment for the past 20 minutes and the page keeps timing out.",
    "Just got back from the gym and I can barely walk up the stairs lmao. Leg day was brutal but at least I finally went after putting it off for two weeks.",
    "Anyone else feel like time goes way too fast? It feels like the semester just started and now we already have midterms next week. How??",
    "My mom sent me a care package with homemade cookies and I almost cried. Being away from home is tough sometimes but little things like that make it better.",
    "I really should stop spending so much money on DoorDash. My bank account is crying but cooking after a long day of classes sounds awful.",
    "Got into the biggest argument with my group project partner today. They literally haven't done anything and the deadline is in two days. I'm so over group work.",
    "Woke up at 6am for a class that ended up being cancelled. The professor didn't even send an email until I was already there. Cool cool cool.",
    "Alright I just discovered this amazing lo-fi playlist on Spotify and it's literally the only reason I've been able to focus on studying tonight.",
    "Can we talk about how overpriced campus food is? $12 for a sad looking sandwich?? I miss my mom's cooking so much right now.",
    "Found a $20 bill in my jacket pocket from like months ago and honestly that made my entire day. It's the little wins that count.",
    # --- New: Personal stories / anecdotes ---
    "So funny story - I accidentally walked into the wrong class today and sat there for 10 minutes before realizing it was an advanced physics lecture. I'm a history major.",
    "My friend convinced me to try rock climbing and I got stuck halfway up the wall. Had to get helped down. Not my proudest moment but everyone was really nice about it.",
    "I've been learning guitar for about 3 months now and I can finally play a full song without messing up! It's just a simple one but still feels like a huge accomplishment.",
    "Lost my phone on the bus yesterday and some kind stranger actually returned it to the lost and found. Faith in humanity restored honestly.",
    "Had a job interview over Zoom and my cat decided to jump on my keyboard right in the middle of it. The interviewer laughed so hopefully that's a good sign?",
    "My neighbor's car alarm has been going off every night at 3am for the past week. I've barely slept and I'm starting to lose my mind a little bit.",
    "Went to a concert last night and my voice is completely gone today. Worth it though, the band was incredible live. Way better than their recordings.",
    "I've been trying to eat healthier but my willpower disappears every time I walk past the vending machine. Those cookies just call to me.",
    "Accidentally sent a text complaining about my boss TO my boss. Worst feeling in the world. Spent the whole day panicking but she was actually cool about it.",
    "Started journaling before bed and honestly it's been really helpful for my anxiety. Sometimes just getting thoughts out of your head and onto paper makes a big difference.",
    # --- New: Opiniated / informal essays ---
    "Here's my hot take - pineapple absolutely belongs on pizza and I will die on this hill. The sweet and savory combo is chef's kiss. Fight me.",
    "People who say they don't like dogs have clearly never had a dog greet them after a long day. There is nothing better than a wagging tail when you walk through the door.",
    "I don't get why everyone's obsessed with hustle culture. Like yeah working hard is great but also I need sleep and hobbies and time to do nothing sometimes.",
    "Unpopular opinion maybe but I actually prefer physical books over e-readers. There's something about the smell and feel of real pages that a screen just can't replicate.",
    "Look I know social media is supposedly bad for us but I've actually made some really good friends through Twitter. Not everything online is toxic.",
    "Call me old fashioned but I still think handwritten thank you notes are way more meaningful than a text or email. Takes like 5 minutes and people really appreciate it.",
    "The whole debate about whether cereal is a soup makes my brain hurt. Like techincally it's a grain in liquid?? But also no?? I think about this more than I should.",
    "Why do we still have to memorize formulas in math class when we literally carry calculators in our pockets? Can someone explain this to me because I genuinely don't understand.",
    "I'll never understand people who enjoy waking up early. I've tried being a morning person and it lasted exactly two days before I went back to my night owl ways.",
    "Honestly the best part of working from home isn't avoiding the commute or wearing pajamas - it's being able to eat lunch without making small talk in the break room.",
    # --- New: Student writing / imperfect ---
    "The thing about history is that its way more interesting than people give it credit for. Like there are some absolutely wild stories that actually happened and nobody talks about them.",
    "I wrote my essay at 2am the night before it was due and somehow got a B+. I mean I know I should plan better but hey if it works it works right?",
    "My professor keeps saying 'lets circle back to this' and then never actually circles back. We have like 5 topics hanging in limbo at this point.",
    "Just realized I've been spelling 'necessary' wrong my whole life. One C two S's. Or wait is it two C's one S? See this is exactly what I mean.",
    "Been staring at this blank Word document for 30 minutes trying to write my intro paragraph. The cursor is just blinking at me judgmentally.",
    "Group projects would be fine if everyone actually did their part. But no there's always that one person who shows up with nothing and expects the rest of us to carry them.",
    "I thought I understood the assignment until I read it for the third time and now I'm more confused than ever. Maybe I should just go to office hours.",
    "Submitted my paper with 30 seconds to spare and my heart was literally pounding. Nothing like a deadline to make you suddenly able to write 500 words in an hour.",
    "I accidentally cited a Wikipedia article in my research paper. My professor caught it obviously. Lesson learned - always check your sources twice.",
    "Is it just me or does every research paper start with 'In today's society' or 'Since the dawn of time'? I'm guilty of this too but we really need better opening lines.",
    # --- New: Reflective / emotional ---
    "Sometimes I wonder if I picked the right major. Like I enjoy what I'm studying but then I see my friends in other programs having so much fun with their classes.",
    "College has taught me more about myself than any class ever could. Learning to live on my own, manage my time, deal with stress - that's the real education honestly.",
    "I miss being a kid when the hardest decision was what game to play at recess. Now I'm over here trying to figure out my entire future and it's overwhelming.",
    "Graduation is in 3 months and I have absolutely no plan for after. Everyone keeps asking what I'm doing next and I just smile and change the subject.",
    "Had a really good conversation with a stranger on the train today. We talked for like 40 minutes about everything from music to philosophy. Sometimes people surprise you.",
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
