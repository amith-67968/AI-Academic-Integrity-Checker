# 🛡️ AI Academic Integrity Checker

A web application that classifies whether content is **AI-generated or human-written** using a supervised ML classifier (TF-IDF + Logistic Regression). Supports multiple input formats, provides **sentence-level highlighting**, and maintains a **ChatGPT-style history** system.

---

## 🎯 Goal

Detect AI-generated academic content with explainable, probability-based results. Users can submit text directly or upload files (PDF, Image, TXT), and get per-sentence AI confidence scores with visual highlighting.

---

## 🏗️ System Architecture

```
Frontend (React + Vite)      →  http://localhost:5173
        ↓ REST API
Backend (Flask)              →  http://localhost:5000
        ↓
Text Extraction Layer (PDF / OCR / TXT)
        ↓
ML Classifier (TF-IDF + Logistic Regression)
        ↓
Supabase Database (PostgreSQL + Auth)
```

---

## ⚙️ Tech Stack

| Layer      | Technology                                  |
|------------|---------------------------------------------|
| Frontend   | React 19 + Vite 8                           |
| Backend    | Python (Flask 3.1)                          |
| Database   | Supabase (PostgreSQL + Auth + RLS)          |
| ML Model   | TF-IDF + Logistic Regression (scikit-learn) |
| API        | REST                                        |
| OCR        | Tesseract (pytesseract)                     |
| PDF        | PyPDF2                                      |

---

## 📁 Project Structure

```
Hire-4-Thon/
├── backend/                        # Python Flask API + ML
│   ├── app.py                      # Flask API (auth, analyze, history)
│   ├── ml_model.py                 # ML inference (analyze_text → label + probs + highlights)
│   ├── train_model.py              # One-time model training script (50 samples)
│   ├── text_extractor.py           # PDF, OCR, TXT text extraction
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example                # Env var template
│   └── model/                      # Saved model (.pkl) — auto-generated
│       └── ai_detector_pipeline.pkl
│
├── frontend/                       # React + Vite
│   ├── src/
│   │   ├── App.jsx                 # Root component + routing + session mgmt
│   │   ├── App.css                 # All component styles (dark theme)
│   │   ├── main.jsx                # Entry point
│   │   ├── index.css               # Global styles + CSS design tokens
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Login page (Supabase Auth)
│   │   │   ├── Signup.jsx          # Signup page (calls backend + sets session)
│   │   │   └── Dashboard.jsx       # Main dashboard (orchestrates all components)
│   │   ├── components/
│   │   │   ├── Sidebar.jsx         # ChatGPT-style history sidebar
│   │   │   ├── InputArea.jsx       # Text input + file upload + analyze button
│   │   │   ├── ResultsDisplay.jsx  # Probability bars + sentence highlighting
│   │   │   └── ProfilePopup.jsx    # User avatar → dropdown (email, logout)
│   │   └── lib/
│   │       └── supabase.js         # Supabase client initialization
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
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
# Train the ML model (one-time, ~2 seconds)
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
- Profile popup (top-right) with username, email, logout

### 2. 📄 Multi-Input Support
- **Text**: Direct paste/type in textarea
- **PDF**: Text extraction via PyPDF2
- **Image**: OCR via pytesseract (PNG, JPG, BMP, TIFF, WebP)
- **TXT**: Direct file read

### 3. 🤖 AI Detection (Classifier-Based)
- **Pipeline**: TF-IDF Vectorizer (unigrams + bigrams) → Logistic Regression
- **Training**: 50 synthetic samples (25 AI-style + 25 human-style)
- **Output**: Probability scores (AI% + Human%)

### 4. 📊 Probability-Based Decision Logic
| AI Probability | Label             |
|----------------|-------------------|
| ≥ 50%          | 🤖 AI Generated   |
| < 50%          | ✍️ Human Generated |

### 5. 🔍 Sentence-Level Highlighting
- Each sentence scored independently
- Sentences with AI probability > 60% highlighted in **red**
- Sentences below threshold highlighted in **green**
- Per-sentence AI confidence percentage shown

### 6. 💬 ChatGPT-Style History
- Every submission saved as a conversation entry
- Left sidebar lists all past analyses (newest first)
- Click any entry to reload full results
- "New Check" button to start fresh

### 7. 🖥️ Dashboard UI
```
┌─────────────┬────────────────────────────────────┐
│ Sidebar     │  Header (title + profile avatar)    │
│             ├────────────────────────────────────┤
│ History     │  Input Area                         │
│ (chat-style)│  ┌──────────────────────────────┐  │
│             │  │ Textarea + File Upload        │  │
│ [entry 1]   │  │ [Analyze Button]              │  │
│ [entry 2]   │  └──────────────────────────────┘  │
│ [entry 3]   │                                     │
│ ...         │  Results Display                    │
│             │  ┌──────────────────────────────┐  │
│             │  │ AI/Human Label Badge          │  │
│             │  │ Probability Bars              │  │
│ [+ New]     │  │ Highlighted Sentences         │  │
│             │  └──────────────────────────────┘  │
└─────────────┴────────────────────────────────────┘
```

---

## 🔌 API Endpoints

| Method | Endpoint            | Description              | Auth Required |
|--------|---------------------|--------------------------|:---:|
| POST   | `/signup`           | Create a new account     | ❌ |
| POST   | `/login`            | Sign in with credentials | ❌ |
| POST   | `/analyze`          | Analyze text or file     | ✅ |
| GET    | `/history`          | List user's submissions  | ✅ |
| GET    | `/submission/:id`   | Get full submission      | ✅ |

### POST `/analyze`
**Accepts:**
- JSON: `{ "text": "your content here" }`
- Multipart form: `file` field (PDF/Image/TXT)

**Returns:**
```json
{
  "id": "uuid",
  "label": "AI Generated",
  "ai_probability": 78.5,
  "human_probability": 21.5,
  "highlighted_sentences": [
    { "sentence": "...", "ai_probability": 85.2, "is_ai": true },
    { "sentence": "...", "ai_probability": 32.1, "is_ai": false }
  ]
}
```

---

## 🗄️ Database Schema (Supabase)

### `profiles` table
| Column     | Type        | Description           |
|------------|-------------|------------------------|
| id         | UUID (PK)   | References auth.users  |
| email      | TEXT        | User email             |
| username   | TEXT        | Display name           |
| created_at | TIMESTAMPTZ | Account creation time  |

### `submissions` table
| Column                | Type        | Description                |
|-----------------------|-------------|----------------------------|
| id                    | UUID (PK)   | Auto-generated             |
| user_id               | UUID (FK)   | References auth.users      |
| input_text            | TEXT        | Submitted content          |
| result                | TEXT        | "AI Generated" or "Human Generated" |
| ai_probability        | FLOAT       | AI confidence (0-100)      |
| human_probability     | FLOAT       | Human confidence (0-100)   |
| highlighted_sentences | JSONB       | Per-sentence analysis      |
| created_at            | TIMESTAMPTZ | Submission time            |

Both tables have **Row Level Security** — users can only access their own data.

---

## 🧠 ML Model Details

- **Algorithm**: TF-IDF Vectorizer → Logistic Regression
- **Features**: Unigrams + bigrams, max 5000 features, sublinear TF scaling
- **Training Data**: 50 synthetic samples (25 AI-style, 25 human-style text)
- **Cross-validation**: 100% accuracy on training set
- **Decision Threshold**: AI probability ≥ 0.5 → "AI Generated"
- **Sentence Threshold**: AI probability > 0.6 → highlighted as AI
- **Model File**: `backend/model/ai_detector_pipeline.pkl`

> 💡 For production, replace the synthetic dataset with a real AI-vs-human corpus (e.g., from GPT-generated essays vs. student-written essays) for better accuracy.

---

## 💡 Key Design Decisions

1. **Lazy Supabase init**: Backend starts without Supabase credentials — ML analysis works standalone
2. **Service-role key for DB writes**: Backend uses service-role key to bypass RLS for inserts
3. **Separate frontend/backend folders**: Enables independent team development
4. **Sentence-level scoring**: Each sentence analyzed independently for granular feedback

---

## 👥 Team

| Role | Name |
|------|------|
| Backend + ML | *[your name]* |
| Frontend     | *[teammate names]* |