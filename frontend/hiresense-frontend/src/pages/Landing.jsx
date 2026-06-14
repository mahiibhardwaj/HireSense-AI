import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

/* =========================
   ARC SCORE (IMPROVED)
========================= */
const ArcScore = ({ score = 82 }) => {
  const radius = 52;
  const stroke = 5;
  const normalizedRadius = radius - stroke;
  const circumference = 2 * Math.PI * normalizedRadius;

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let start = 0;

    const interval = setInterval(() => {
      start += 2;
      if (start >= score) {
        start = score;
        clearInterval(interval);
      }
      setProgress(start);
    }, 18);

    return () => clearInterval(interval);
  }, [score]);

  const strokeDashoffset =
    circumference - (progress / 100) * circumference;

  const color =
    score >= 80 ? "#A3E635" : score >= 60 ? "#F59E0B" : "#EF4444";

  return (
    <div className="relative flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
        <circle
          stroke="#1e2535"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
        />
      </svg>

      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-semibold" style={{ color }}>
          {progress}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-slate-500 mt-0.5">
          ATS
        </span>
      </div>
    </div>
  );
};

/* =========================
   SAMPLE DATA
========================= */
const skills = {
  matched: ["Java", "React", "Node.js", "MongoDB", "REST APIs"],
  missing: ["AWS", "Docker", "Kubernetes"],
};

/* =========================
   LANDING PAGE
========================= */
export default function Landing() {
  const [showDemo, setShowDemo] = useState(false);
  const [visible, setVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );

    if (cardRef.current) obs.observe(cardRef.current);

    return () => obs.disconnect();
  }, []);

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background: "#080B12",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ================= CSS ================= */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');

        .display-font { font-family: 'Syne', sans-serif; }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #4F46E5;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: 0.2s;
        }
        .btn-primary:hover { transform: translateY(-2px); background: #4338CA; }

        .btn-ghost {
          background: transparent;
          border: 1px solid #1e2535;
          color: #94a3b8;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn-ghost:hover {
          border-color: #334155;
          color: #e2e8f0;
        }

        .dashboard-card {
          background: #0d1120;
          border: 1px solid #1a2236;
          border-radius: 16px;
          padding: 28px;
          opacity: 0;
          transform: translateY(24px);
          transition: 0.7s ease;
        }

        .dashboard-card.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .inner-card {
          background: #111827;
          border: 1px solid #1e2840;
          border-radius: 10px;
          padding: 18px;
          transition: 0.25s;
        }

        .inner-card:hover {
          transform: translateY(-3px);
          border-color: #4F46E5;
        }

        .pill-tag {
          font-size: 12px;
          padding: 4px 10px;
          border-radius: 999px;
          display: inline-block;
        }

        .pill-match {
          background: rgba(163,230,53,0.1);
          color: #a3e635;
          border: 1px solid rgba(163,230,53,0.2);
        }

        .pill-miss {
          background: rgba(239,68,68,0.08);
          color: #f87171;
          border: 1px solid rgba(239,68,68,0.15);
        }

        .divider {
          height: 1px;
          background: #1a2236;
        }

        .suggestion-row {
          display: flex;
          gap: 10px;
          padding: 8px 0;
          font-size: 13px;
          color: #94a3b8;
          border-bottom: 1px solid #1a2236;
        }

        .suggestion-row:last-child {
          border-bottom: none;
        }

        .suggestion-dot {
          width: 4px;
          height: 4px;
          background: #4F46E5;
          border-radius: 50%;
          margin-top: 6px;
          flex-shrink: 0;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-anim {
          animation: fadeUp 0.8s ease-out;
        }
      `}</style>

      {/* ================= NAV ================= */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 48px",
          position: "sticky",
          top: 0,
          background: "rgba(8,11,18,0.9)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ fontWeight: 600 }}>HireSense AI</div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link to="/login" className="btn-primary">
            Login
          </Link>
          <Link to="/register" className="btn-primary">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section
        className="hero-anim"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          padding: "100px 48px",
          maxWidth: 1200,
          margin: "0 auto",
          gap: 60,
        }}
      >
        <div>
          <h1
            className="display-font"
            style={{ fontSize: 56, lineHeight: 1.1 }}
          >
            Resume that gets <span style={{ color: "#4F46E5" }}>you hired</span>
          </h1>

          <p style={{ color: "#64748b", marginTop: 20, maxWidth: 420 }}>
            AI-powered ATS analysis, keyword matching, and resume rewriting to
            boost your interview chances instantly.
          </p>

          <div style={{ marginTop: 30, display: "flex", gap: 12 }}>
            <Link to="/register" className="btn-primary">
              Analyze Resume
            </Link>

            <button
              className="btn-ghost"
              onClick={() => setShowDemo(true)}
            >
              See Demo
            </button>
          </div>
        </div>

        {/* ================= PREVIEW ================= */}
        <div
          ref={cardRef}
          className={`dashboard-card ${visible ? "visible" : ""}`}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <p style={{ color: "#64748b", fontSize: 12 }}>ATS Analysis</p>
              <h3>Software Engineer Role</h3>
            </div>
            <ArcScore score={82} />
          </div>

          <div className="divider" style={{ margin: "20px 0" }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="inner-card">
              <p style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>Matched</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {skills.matched.map((s) => (
                  <span key={s} className="pill-tag pill-match">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="inner-card">
              <p style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>Missing</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {skills.missing.map((s) => (
                  <span key={s} className="pill-tag pill-miss">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="inner-card" style={{ marginTop: 12 }}>
            <p style={{ fontSize: 11, color: "#64748b" }}>Suggestions</p>

            {[
              "Add AWS experience",
              "Include Docker & Kubernetes",
              "Quantify achievements",
            ].map((s) => (
              <div key={s} className="suggestion-row">
                <div className="suggestion-dot" />
                {s}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= DEMO MODAL ================= */}
      {showDemo && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "80%",
              maxWidth: 800,
              background: "#0d1120",
              borderRadius: 12,
              padding: 16,
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowDemo(false)}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                color: "white",
                background: "transparent",
                border: "none",
                fontSize: 18,
                cursor: "pointer",
              }}
            >
              ✕
            </button>

            <video
              src="/demo.mp4"
              controls
              autoPlay
              style={{ width: "100%", borderRadius: 8 }}
            />
          </div>
        </div>
      )}

      {/* ================= FOOTER ================= */}
      <footer
        style={{
          padding: 40,
          textAlign: "center",
          color: "#64748b",
          borderTop: "1px solid #1a2236",
        }}
      >
        © 2026 HireSense AI
      </footer>
    </div>
  );
}