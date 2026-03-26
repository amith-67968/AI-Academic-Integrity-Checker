"""
Flask API — AI Academic Integrity Checker
==========================================

Routes:
  POST /signup              Create a new user via Supabase Auth
  POST /login               Sign in an existing user
  POST /analyze             Analyse text or file for AI content
  GET  /history             List user's past submissions
  GET  /submission/<id>     Get a single submission with full results
"""

import os
import json
import traceback
from datetime import datetime
from functools import wraps

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client

from ml_model import analyze_text, load_model
from text_extractor import extract_text

# ── Init ─────────────────────────────────────────────────────────────────────
load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Supabase client (created lazily to allow startup without credentials)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")  # anon key
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # service role key

_supabase = None
_supabase_admin = None

def get_supabase() -> Client:
    """Get the anon Supabase client (lazy init)."""
    global _supabase
    if _supabase is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise RuntimeError(
                "Missing SUPABASE_URL / SUPABASE_KEY env vars. "
                "Copy .env.example → .env and fill in your Supabase credentials."
            )
        _supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _supabase

def get_supabase_admin() -> Client:
    """Get the service-role Supabase client (lazy init)."""
    global _supabase_admin
    if _supabase_admin is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            raise RuntimeError(
                "Missing SUPABASE_URL / SUPABASE_SERVICE_KEY env vars. "
                "Copy .env.example → .env and fill in your Supabase credentials."
            )
        _supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    return _supabase_admin

if not SUPABASE_URL or not SUPABASE_KEY or not SUPABASE_SERVICE_KEY:
    print("⚠️  Missing Supabase env vars! Copy .env.example → .env and fill in credentials.")
    print("   Required: SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_KEY")
    print("   The server will start, but auth/DB routes will fail until configured.")

# Pre-load the ML model at startup
try:
    load_model()
    print("✅ ML model loaded successfully")
except FileNotFoundError as e:
    print(f"⚠️  {e}")


# ── Auth helper ──────────────────────────────────────────────────────────────

def require_auth(f):
    """Decorator: extracts user from Supabase JWT in Authorization header."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header"}), 401
        token = auth_header.split(" ", 1)[1]
        try:
            # Verify session using the token
            user_response = get_supabase().auth.get_user(token)
            user = user_response.user
            if not user:
                return jsonify({"error": "Invalid token"}), 401
            request.user = user
            request.token = token
        except Exception as e:
            return jsonify({"error": f"Auth failed: {str(e)}"}), 401
        return f(*args, **kwargs)
    return decorated


# ── Routes: Auth ─────────────────────────────────────────────────────────────

@app.route("/signup", methods=["POST"])
def signup():
    """Create a new account via Supabase Auth."""
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    username = data.get("username", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        # Sign up via Supabase Auth
        res = get_supabase().auth.sign_up({
            "email": email,
            "password": password,
            "options": {"data": {"username": username}},
        })

        user = res.user
        if not user:
            return jsonify({"error": "Signup failed"}), 400

        # Insert profile row
        get_supabase_admin().table("profiles").upsert({
            "id": user.id,
            "email": email,
            "username": username,
        }).execute()

        return jsonify({
            "message": "Account created successfully",
            "user": {
                "id": user.id,
                "email": email,
                "username": username,
            },
            "session": {
                "access_token": res.session.access_token if res.session else None,
                "refresh_token": res.session.refresh_token if res.session else None,
            }
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/login", methods=["POST"])
def login():
    """Sign in with email & password."""
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        res = get_supabase().auth.sign_in_with_password({
            "email": email,
            "password": password,
        })
        user = res.user
        session = res.session

        # Fetch username from profiles
        profile = get_supabase_admin().table("profiles").select("username").eq("id", user.id).single().execute()
        username = profile.data.get("username", "") if profile.data else ""

        return jsonify({
            "user": {
                "id": user.id,
                "email": user.email,
                "username": username,
            },
            "session": {
                "access_token": session.access_token,
                "refresh_token": session.refresh_token,
            }
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 401


# ── Routes: Analysis ─────────────────────────────────────────────────────────

@app.route("/analyze", methods=["POST"])
@require_auth
def analyze():
    """
    Analyse text for AI-generated content.
    Accepts either:
      - JSON body with { "text": "..." }
      - Form-data with a file (PDF / image / TXT)
    """
    user = request.user
    text = None

    # ── Extract text from input ──────────────────────────────────────
    if request.content_type and "multipart/form-data" in request.content_type:
        # File upload
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400
        file = request.files["file"]
        if not file.filename:
            return jsonify({"error": "Empty filename"}), 400
        try:
            text = extract_text(file, file.filename)
        except Exception as e:
            return jsonify({"error": f"Text extraction failed: {str(e)}"}), 400

        # Also check for text field alongside file
        if not text and request.form.get("text"):
            text = request.form.get("text")
    else:
        data = request.get_json(silent=True) or {}
        text = data.get("text", "")

    if not text or not text.strip():
        return jsonify({"error": "No text provided or extracted"}), 400

    # ── Run ML analysis ──────────────────────────────────────────────
    try:
        result = analyze_text(text.strip())
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

    # ── Store in Supabase ────────────────────────────────────────────
    try:
        row = {
            "user_id": user.id,
            "input_text": text.strip(),
            "result": result["label"],
            "ai_probability": result["ai_probability"],
            "human_probability": result["human_probability"],
            "highlighted_sentences": json.dumps(result["highlighted_sentences"]),
            "created_at": datetime.utcnow().isoformat(),
        }
        insert_res = get_supabase_admin().table("submissions").insert(row).execute()
        submission_id = insert_res.data[0]["id"] if insert_res.data else None
    except Exception as e:
        traceback.print_exc()
        # Don't fail the request if DB insert fails — still return analysis
        submission_id = None

    return jsonify({
        "id": submission_id,
        "label": result["label"],
        "ai_probability": result["ai_probability"],
        "human_probability": result["human_probability"],
        "highlighted_sentences": result["highlighted_sentences"],
    }), 200


# ── Routes: History ──────────────────────────────────────────────────────────

@app.route("/history", methods=["GET"])
@require_auth
def history():
    """Return the current user's submission history, newest first."""
    user = request.user
    try:
        res = get_supabase_admin().table("submissions") \
            .select("id, input_text, result, ai_probability, human_probability, created_at") \
            .eq("user_id", user.id) \
            .order("created_at", desc=True) \
            .execute()

        submissions = []
        for row in res.data:
            submissions.append({
                "id": row["id"],
                "preview": (row["input_text"][:80] + "...") if len(row["input_text"]) > 80 else row["input_text"],
                "result": row["result"],
                "ai_probability": row["ai_probability"],
                "human_probability": row["human_probability"],
                "created_at": row["created_at"],
            })

        return jsonify({"submissions": submissions}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/submission/<submission_id>", methods=["GET"])
@require_auth
def get_submission(submission_id):
    """Return a single submission with full highlighted sentences."""
    user = request.user
    try:
        res = get_supabase_admin().table("submissions") \
            .select("*") \
            .eq("id", submission_id) \
            .eq("user_id", user.id) \
            .single() \
            .execute()

        if not res.data:
            return jsonify({"error": "Submission not found"}), 404

        row = res.data
        highlighted = row.get("highlighted_sentences")
        if isinstance(highlighted, str):
            highlighted = json.loads(highlighted)

        return jsonify({
            "id": row["id"],
            "input_text": row["input_text"],
            "result": row["result"],
            "ai_probability": row["ai_probability"],
            "human_probability": row["human_probability"],
            "highlighted_sentences": highlighted,
            "created_at": row["created_at"],
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── Run ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
