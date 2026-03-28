# 🛡️ AI Academic Integrity Checker

A premium, modern web application that classifies whether content is **AI-generated or human-written** using a **hybrid ML classifier (TF-IDF + RoBERTa Ensemble)**. Designed with a sleek dark aesthetic, this tool supports multiple input formats, provides **sentence-level highlighting**, and maintains a **ChatGPT-style history** system.

---

## 🎯 Goal

Transitioning from a terminal-based tool to a fully polished React/Vite frontend, this platform detects AI-generated academic content with explainable, probability-based results. Users can submit text directly or upload files (PDF, Image, TXT), and receive per-sentence AI confidence scores with visual highlighting in a highly responsive, modern UI.

---

## 🏗️ System Architecture

```text
Frontend (React + Vite + Tailwind CSS)  →  http://localhost:5173
        ↓ REST API
Backend (Python/Flask)                  →  http://localhost:5000
        ↓
Text Extraction Layer (PDF / OCR / TXT)
        ↓
Hybrid ML Classifier (RoBERTa Transformer + TF-IDF Ensemble)
        ↓
Supabase Database (PostgreSQL + Auth)
```

---

## ⚙️ Tech Stack

| Layer      | Technology                                  |
|------------|---------------------------------------------|
| Frontend   | React 19 + Vite 8 + Tailwind CSS            |
| UI Design  | Premium Dark Mode (Navy, Indigo, Violet)    |
| Backend    | Python (Flask 3.1)                          |
| Database   | Supabase (PostgreSQL + Auth + RLS)          |
| ML Model   | Hybrid: RoBERTa + TF-IDF / Logistic Reg     |
| API        | REST                                        |
| OCR        | Tesseract (pytesseract)                     |
| PDF        | PyPDF2                                      |

---

## 📁 Project Structure

```text
Hire-4-Thon/
├── backend/                        # Python Flask API + ML
│   ├── app.py                      # Flask API (auth, analyze, history)
│   ├── hybrid_detector.py          # Primary ML inference (TF-IDF + RoBERTa)
│   ├── ml_model.py                 # Fallback ML inference module
│   ├── train_model.py              # One-time model training script
│   ├── text_extractor.py           # PDF, OCR, TXT text extraction
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example                # Env var template
│   └── model/                      # Saved models (.pkl)
│       └── ai_detector_pipeline.pkl
│
├── frontend/                       # React + Vite
│   ├── src/
│   │   ├── App.jsx                 # Root component + routing + session mgmt
│   │   ├── main.jsx                # Entry point
│   │   ├── index.css               # Global styles + Tailwind directives
│   │   ├── pages/
│   │   │   ├── Landing.jsx         # Premium landing page
│   │   │   ├── Login.jsx           # Login page (Supabase Auth)
│   │   │   ├── Signup.jsx          # Signup page
│   │   │   ├── Dashboard.jsx       # Main dashboard (orchestrates all components)
│   │   │   └── Results.jsx         # Detailed sentence-level results
│   │   ├── components/
│   │   │   ├── Sidebar.jsx         # ChatGPT-style history sidebar
│   │   │   ├── InputArea.jsx       # Text input + file upload + analyze button
│   │   │   ├── ResultsDisplay.jsx  # Probability bars + sentence highlighting
│   │   │   └── ProfilePopup.jsx    # User avatar dropdown
│   │   └── lib/
│   │       └── supabase.js         # Supabase client initialization
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js          # Tailwind theme configuration
│
├── database/
│   └── schema.sql                  # Supabase SQL (profiles + submissions + RLS)
│
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.9
- **Supabase** project ([supabase.com](https://supabase.com) — free tier works)
- **Tesseract OCR** *(optional, for image uploads)* — [Download](https://github.com/tesseract-ocr/tesseract)

---

### Step 1: Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** → paste and run `database/schema.sql`
3. Go to **Settings → API** and copy:
   - **Project URL** (e.g. `https://abc123.supabase.co`)
   - **anon public** key
   - **service_role** key

---

### Step 2: Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env         # Windows
# cp .env.example .env         # Mac/Linux
```

Edit `backend/.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
TESSERACT_PATH=C:\Program Files\Tesseract-OCR\tesseract.exe   # optional
```

```bash
# Train the baseline ML model (one-time)
python train_model.py

# Start the server
python app.py
```

✅ Backend runs at: **http://localhost:5000**

---

### Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
copy .env.example .env         # Windows
# cp .env.example .env         # Mac/Linux
```

Edit `frontend/.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:5000
```

```bash
# Start dev server
npm run dev
```

✅ Frontend runs at: **http://localhost:5173**

---

## ⚙️ Core Features

### 1. 🔐 Authentication
- Signup/Login via Supabase Auth
- JWT-based session management
- Profile popup with user metadata and session handling

### 2. 📄 Multi-Input Support
- **Text**: Direct paste/type in textarea
- **PDF**: Text extraction via PyPDF2
- **Image**: OCR via pytesseract (PNG, JPG, BMP, TIFF, WebP)
- **TXT**: Direct file read

### 3. 🤖 Hybrid AI Detection
- **Pipeline**: RoBERTa Transformer combined with TF-IDF + Logistic Regression ensemble
- **Graceful Fallback**: Safely drops back to TF-IDF if transformers dependencies are missing
- **Output**: Calibrated probability scores (AI% + Human%)

### 4. 📊 Probability-Based Decision Logic
| AI Probability | Label             |
|----------------|-------------------|
| ≥ 50%          | 🤖 AI Generated   |
| < 50%          | ✍️ Human Generated |

### 5. 🔍 Sentence-Level Highlighting
- Each sentence scored independently
- Sentences with AI probability > 60% highlighted in **red**
- Sentences below threshold highlighted in **green**
- Per-sentence AI confidence percentage clearly displayed

### 6. 💬 ChatGPT-Style History
- Every submission saved as a conversation entry
- Left sidebar lists all past analyses (newest first)
- Click any entry to reload full results quickly

---

## 🔌 API Endpoints

| Method | Endpoint            | Description              | Auth Required |
|--------|---------------------|--------------------------|:---:|
| POST   | `/signup`           | Create a new account     | ❌ |
| POST   | `/login`            | Sign in with credentials | ❌ |
| POST   | `/analyze`          | Analyze text or file     | ✅ |
| GET    | `/history`          | List user's submissions  | ✅ |
| GET    | `/submission/:id`   | Get full submission      | ✅ |

---

## 🗄️ Database Schema 

### `profiles` table
- `id` (UUID PK), `email` (TEXT), `username` (TEXT), `created_at` (TIMESTAMPTZ)

### `submissions` table
- `id` (UUID PK), `user_id` (UUID FK), `input_text` (TEXT), `result` (TEXT)
- `ai_probability` (FLOAT), `human_probability` (FLOAT)
- `highlighted_sentences` (JSONB)
- `created_at` (TIMESTAMPTZ)

*(Both tables incorporate **Row Level Security** to ensure data isolation.)*

---

## 🧠 Model Details

- **Algorithms**: RoBERTa sequence classification + TF-IDF Vectorizer (LogReg)
- **Features**: Semantic context awareness + lexical unigrams/bigrams
- **Decision Threshold**: AI probability ≥ 0.5 → "AI Generated"
- **Sentence Threshold**: AI probability > 0.6 → highlighted as AI

---

## 💡 Key Design Decisions

1. **Lazy Supabase init**: Backend starts without Supabase credentials — ML analysis works standalone.
2. **Modern UI/UX**: Overhauled from a basic terminal layout to a rich, component-driven React application colored with Tailwind CSS.
3. **Resilient Inferencing**: `hybrid_detector.py` ensures execution doesn't fail if the environment lacks transformer packages, using classical NLP as a fallback.
4. **Sentence-level scoring**: Granular feedback is preferred over broad document-level classifications.