-- ============================================================
-- AI Academic Integrity Checker — Supabase Database Schema
-- ============================================================
-- Run this SQL in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email      TEXT,
    username   TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Submissions table (stores every analysis run)
CREATE TABLE IF NOT EXISTS submissions (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    input_text            TEXT NOT NULL,
    result                TEXT NOT NULL,            -- 'AI Generated' or 'Human Generated'
    ai_probability        FLOAT NOT NULL,
    human_probability     FLOAT NOT NULL,
    highlighted_sentences JSONB,                    -- sentence-level analysis array
    created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Row Level Security (RLS)
--    Users can only read/insert their own data.

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own submissions"
    ON submissions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own submissions"
    ON submissions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 4. Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);
