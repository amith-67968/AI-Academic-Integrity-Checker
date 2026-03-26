import React from "react";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const fade = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export default function LandingPage() {
  const [counters, setCounters] = useState({ accuracy: 0, docs: 0, users: 0 });
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!statsVisible) return;
    const duration = 2000, steps = 60, interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const ease = 1 - Math.pow(1 - step / steps, 3);
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
    <motion.div
      className="landing-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="landing-bg">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-grid" />
      </div>

      {/* Nav */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <span className="nav-title">IntegrityAI</span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <Link to="/login" className="nav-btn-ghost">Sign In</Link>
          <Link to="/signup" className="nav-btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <motion.div className="hero-badge" {...fade} transition={{ delay: 0.1 }}>
          <span className="hero-badge-dot" />
          AI-Powered Academic Integrity
        </motion.div>

        <motion.h1 className="hero-title" {...fade} transition={{ delay: 0.2 }}>
          Detect AI-Generated<br />
          <span className="hero-gradient-text">Content Instantly</span>
        </motion.h1>

        <motion.p className="hero-subtitle" {...fade} transition={{ delay: 0.3 }}>
          Advanced machine learning analysis with sentence-level highlighting.
          Upload documents, paste text, and get instant results.
        </motion.p>

        <motion.div className="hero-actions" {...fade} transition={{ delay: 0.4 }}>
          <Link to="/signup" className="btn-hero-primary">
            <span>Get Started Free</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
          <a href="#how-it-works" className="btn-hero-secondary">Learn More</a>
        </motion.div>

        {/* Hero Visual */}
        <motion.div className="hero-visual" {...fade} transition={{ delay: 0.5, duration: 0.6 }}>
          <div className="hero-card-mock">
            <div className="mock-header">
              <div className="mock-dots"><span/><span/><span/></div>
              <span className="mock-title">Analysis Result</span>
            </div>
            <div className="mock-body">
              <div className="mock-gauge">
                <svg viewBox="0 0 100 100" className="mock-gauge-svg">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="5"/>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#EF4444" strokeWidth="5"
                    strokeDasharray="251.2" strokeDashoffset="54" strokeLinecap="round"
                    transform="rotate(-90 50 50)" className="mock-gauge-fill" style={{opacity: 0.7}}/>
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
        </motion.div>
      </section>

      {/* Stats */}
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

      {/* Features */}
      <section className="features-section" id="features">
        <div className="section-header">
          <span className="section-badge">Features</span>
          <h2 className="section-title">Everything You Need</h2>
          <p className="section-subtitle">Powerful tools to ensure academic integrity with AI-powered detection</p>
        </div>
        <div className="features-grid">
          {[
            { icon: "📄", title: "Multi-Format Upload", desc: "Support for PDF documents, images (OCR), and plain text files." },
            { icon: "⚡", title: "Real-Time Detection", desc: "Hybrid ML engine combining TF-IDF and transformer models." },
            { icon: "🎯", title: "Sentence Highlighting", desc: "Color-coded sentence-level analysis showing AI confidence." },
            { icon: "📊", title: "Analysis History", desc: "Review past analyses anytime with full result recovery." },
          ].map((f, i) => (
            <motion.div key={i} className="feature-card"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -2 }}
            >
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
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
          {[
            { n: "1", title: "Upload Content", desc: "Paste text directly, or upload PDF, image, or text files." },
            { n: "2", title: "AI Analysis", desc: "Our hybrid ML engine analyzes patterns at the sentence level." },
            { n: "3", title: "Review Results", desc: "Get detailed probability scores and sentence-level highlighting." },
          ].map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div className="how-connector" />}
              <div className="how-step">
                <div className="how-step-number">{s.n}</div>
                <div className="how-step-content">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-card">
          <h2>Ready to Verify Content Integrity?</h2>
          <p>Start detecting AI-generated content in seconds. Free to use.</p>
          <Link to="/signup" className="btn-hero-primary">
            <span>Create Free Account</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
    </motion.div>
  );
}
