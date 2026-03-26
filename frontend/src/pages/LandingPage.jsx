import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

export default function LandingPage() {
  const [counters, setCounters] = useState({ accuracy: 0, docs: 0, users: 0 });
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsVisible(true);
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!statsVisible) return;
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounters({
        accuracy: (99.2 * ease).toFixed(1),
        docs: Math.floor(50000 * ease),
        users: Math.floor(10000 * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [statsVisible]);

  return (
    <div className="landing-page">
      {/* Animated Background */}
      <div className="landing-bg">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
        <div className="bg-grid" />
      </div>

      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <div className="nav-logo">
            <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
              <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" stroke="url(#logo-grad)" strokeWidth="1.5" fill="none"/>
              <path d="M12 8v4l3.5 2" stroke="url(#logo-grad)" strokeWidth="1.5" strokeLinecap="round"/>
              <defs>
                <linearGradient id="logo-grad" x1="3" y1="2" x2="21" y2="22">
                  <stop stopColor="#7c3aed"/>
                  <stop offset="1" stopColor="#a78bfa"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="nav-title">IntegrityAI</span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <Link to="/login" className="nav-btn-ghost">Sign In</Link>
          <Link to="/signup" className="nav-btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          AI-Powered Academic Integrity
        </div>
        <h1 className="hero-title">
          Detect AI-Generated
          <br />
          <span className="hero-gradient-text">Content Instantly</span>
        </h1>
        <p className="hero-subtitle">
          Advanced machine learning analysis with sentence-level highlighting.
          Upload documents, paste text, and get instant AI detection results
          with confidence scores.
        </p>
        <div className="hero-actions">
          <Link to="/signup" className="btn-hero-primary">
            <span>Get Started Free</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
          <a href="#how-it-works" className="btn-hero-secondary">
            Learn More
          </a>
        </div>

        {/* Hero Visual */}
        <div className="hero-visual">
          <div className="hero-card-mock">
            <div className="mock-header">
              <div className="mock-dots">
                <span /><span /><span />
              </div>
              <span className="mock-title">Analysis Result</span>
            </div>
            <div className="mock-body">
              <div className="mock-gauge">
                <svg viewBox="0 0 100 100" className="mock-gauge-svg">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="6"/>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="url(#gauge-grad)" strokeWidth="6"
                    strokeDasharray="251.2" strokeDashoffset="54" strokeLinecap="round"
                    transform="rotate(-90 50 50)" className="mock-gauge-fill"/>
                  <defs>
                    <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ef4444"/>
                      <stop offset="100%" stopColor="#f97316"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="mock-gauge-text">
                  <span className="mock-gauge-value">78.5%</span>
                  <span className="mock-gauge-label">AI Detected</span>
                </div>
              </div>
              <div className="mock-sentences">
                <div className="mock-sentence ai">
                  <div className="mock-sent-bar" style={{width: '85%'}} />
                  <span>AI — 85%</span>
                </div>
                <div className="mock-sentence human">
                  <div className="mock-sent-bar" style={{width: '25%'}} />
                  <span>Human — 25%</span>
                </div>
                <div className="mock-sentence ai">
                  <div className="mock-sent-bar" style={{width: '92%'}} />
                  <span>AI — 92%</span>
                </div>
                <div className="mock-sentence human">
                  <div className="mock-sent-bar" style={{width: '15%'}} />
                  <span>Human — 15%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section" ref={statsRef}>
        <div className="stat-item">
          <span className="stat-value">{counters.accuracy}%</span>
          <span className="stat-label">Detection Accuracy</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value">{Number(counters.docs).toLocaleString()}+</span>
          <span className="stat-label">Documents Analyzed</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value">{Number(counters.users).toLocaleString()}+</span>
          <span className="stat-label">Active Users</span>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="section-header">
          <span className="section-badge">Features</span>
          <h2 className="section-title">Everything You Need</h2>
          <p className="section-subtitle">Powerful tools to ensure academic integrity with AI-powered detection</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <h3>Multi-Format Upload</h3>
            <p>Support for PDF documents, images (OCR), and plain text files. Drag and drop or paste directly.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon feature-icon-accent">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2a10 10 0 110 20 10 10 0 010-20z"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <h3>Real-Time Detection</h3>
            <p>Hybrid ML engine combining TF-IDF and transformer models for accurate AI content detection.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon feature-icon-success">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18M9 3v18"/>
              </svg>
            </div>
            <h3>Sentence Highlighting</h3>
            <p>Color-coded sentence-level analysis showing AI confidence for every sentence in your text.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon feature-icon-warning">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </div>
            <h3>Analysis History</h3>
            <p>ChatGPT-style history sidebar. Review past analyses anytime with full result recovery.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section" id="how-it-works">
        <div className="section-header">
          <span className="section-badge">Process</span>
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Three simple steps to verify content authenticity</p>
        </div>
        <div className="how-steps">
          <div className="how-step">
            <div className="how-step-number">1</div>
            <div className="how-step-content">
              <h3>Upload Content</h3>
              <p>Paste text directly, or upload PDF, image, or text files. Our system handles all formats seamlessly.</p>
            </div>
          </div>
          <div className="how-connector" />
          <div className="how-step">
            <div className="how-step-number">2</div>
            <div className="how-step-content">
              <h3>AI Analysis</h3>
              <p>Our hybrid ML engine processes your content, analyzing patterns at the sentence level for maximum accuracy.</p>
            </div>
          </div>
          <div className="how-connector" />
          <div className="how-step">
            <div className="how-step-number">3</div>
            <div className="how-step-content">
              <h3>Review Results</h3>
              <p>Get detailed probability scores, sentence-level highlighting, and a clear AI vs Human verdict instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-card">
          <h2>Ready to Verify Content Integrity?</h2>
          <p>Start detecting AI-generated content in seconds. Free to use, no credit card required.</p>
          <Link to="/signup" className="btn-hero-primary">
            <span>Create Free Account</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-brand">
          <span className="nav-title">IntegrityAI</span>
          <span className="footer-copy">© 2026 AI Academic Integrity Checker</span>
        </div>
      </footer>
    </div>
  );
}
