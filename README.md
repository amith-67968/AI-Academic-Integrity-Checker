# 🛡️ AI Academic Integrity Checker

A web application that classifies whether content is **AI-generated or human-written** using a supervised ML classifier. Supports multiple input formats, provides sentence-level highlighting, and maintains a ChatGPT-style history system.

---

## 📁 Project Structure

```
Hire-4-Thon/
├── backend/
│   ├── app.py                  # Flask API (auth, analyze, history)
│   ├── ml_model.py             # ML inference module
│   ├── train_model.py          # One-time model training script
│   ├── text_extractor.py       # PDF, OCR, TXT extraction
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Env var template
│   └── model/                  # Saved model artifacts (auto-generated)
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Root component + routing
│   │   ├── App.css             # Component styles
│   │   ├── main.jsx            # Entry point
│   │   ├── index.css           # Global styles + design tokens
│   │   ├── pages/
│   │   │   ├── Login.jsx       # Login page
│   │   │   ├── Signup.jsx      # Signup page
│   │   │   └── Dashboard.jsx   # Main dashboard
│   │   ├── components/
│   │   │   ├── Sidebar.jsx     # History sidebar
│   │   │   ├── InputArea.jsx   # Text input + file upload
│   │   │   ├── ResultsDisplay.jsx  # Results + highlighting
│   │   │   └── ProfilePopup.jsx    # User profile dropdown
│   │   └── lib/
│   │       └── supabase.js     # Supabase client init
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── database/
│   └── schema.sql              # Supabase SQL schema
└── README.md
```

---

## ⚙️ Tech Stack

| Layer    | Technology                                   |
|----------|----------------------------------------------|
| Frontend | React + Vite                                 |
| Backend  | Python (Flask)                               |
| Database | Supabase (PostgreSQL + Auth)                 |
| ML Model | TF-IDF + Logistic Regression (scikit-learn)  |
| API      | REST                                         |

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.9
- **Supabase** project (free tier works)
- **Tesseract OCR** (optional, for image uploads) — [Download](https://github.com/tesseract-ocr/tesseract)

---

### Step 1: Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Open **SQL Editor** and run the contents of `database/schema.sql`
3. Note your **Project URL** and **anon key** from Settings → API

---

### Step 2: Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env       # Windows
# cp .env.example .env       # Mac/Linux

# Edit .env with your Supabase credentials:
#   SUPABASE_URL=https://your-project.supabase.co
#   SUPABASE_KEY=your-anon-key
#   SUPABASE_SERVICE_KEY=your-service-role-key

# Train the ML model (one-time)
python train_model.py

# Start the server
python app.py
```

Backend runs at: **http://localhost:5000**

---

### Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
copy .env.example .env       # Windows
# cp .env.example .env       # Mac/Linux

# Edit .env:
#   VITE_SUPABASE_URL=https://your-project.supabase.co
#   VITE_SUPABASE_ANON_KEY=your-anon-key
#   VITE_API_URL=http://localhost:5000

# Start dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 🎯 Features

| Feature | Description |
|---------|-------------|
| **Authentication** | Signup/Login via Supabase Auth |
| **Multi-Input** | Text, PDF, Image (OCR), TXT file |
| **AI Detection** | TF-IDF + Logistic Regression classifier |
| **Probability Scores** | AI% and Human% with visual bars |
| **Sentence Highlighting** | Per-sentence analysis with color-coded results |
| **Chat History** | ChatGPT-style sidebar with past analyses |
| **Profile Popup** | Username, email, and logout |

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/signup` | Create account | No |
| POST | `/login` | Sign in | No |
| POST | `/analyze` | Analyse text/file | Yes |
| GET | `/history` | List user's submissions | Yes |
| GET | `/submission/:id` | Get full submission | Yes |

---

## 🧠 ML Model

- **Pipeline**: TF-IDF Vectorizer (bigrams) → Logistic Regression
- **Training Data**: Synthetic dataset of AI-style vs human-style text
- **Decision Rule**: AI probability ≥ 50% → "AI Generated", else "Human Generated"
- **Sentence Analysis**: Each sentence scored independently; > 60% AI highlighted in red

---

## 👥 Team

Backend + ML: *[your name]*
Frontend: *[teammate names]*