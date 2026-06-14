import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { jsPDF } from "jspdf";

// ── Animated ATS Score ────────────────────────────────────────────────
function ScoreRing({ score }) {
  const [drawn, setDrawn] = useState(0);
  const r = 60;
  const circ = 2 * Math.PI * r;

  useEffect(() => {
    const t = setTimeout(() => setDrawn(score), 120);
    return () => clearTimeout(t);
  }, [score]);

  const color = score >= 80 ? "#a3e635" : score >= 60 ? "#f59e0b" : "#ef4444";
  const offset = circ - (drawn / 100) * circ;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
      <div style={{ position: "relative", width: 136, height: 136, flexShrink: 0 }}>
        <svg width="136" height="136" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="68" cy="68" r={r} fill="none" stroke="#1a2236" strokeWidth="8" />
          <circle
            cx="68" cy="68" r={r} fill="none"
            stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.4,0,0.2,1)" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 34, fontWeight: 800, color, lineHeight: 1 }}>
            {score}
          </span>
          <span style={{ fontSize: 10, color: "#4b5568", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>
            ATS score
          </span>
        </div>
      </div>
      <div>
        <p style={{ fontSize: 13, color: "#4b5568", marginBottom: 6 }}>Match quality</p>
        <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: "#f0eef9", lineHeight: 1.2 }}>
          {score >= 80 ? "Strong match" : score >= 60 ? "Moderate match" : "Needs work"}
        </p>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>
          {score >= 80
            ? "Your resume is well-aligned for this role."
            : score >= 60
            ? "A few targeted changes could significantly improve your odds."
            : "Consider addressing the gaps below before applying."}
        </p>
      </div>
    </div>
  );
}

// ── Skill pill ────────────────────────────────────────────────────────
function Pill({ label, variant }) {
  const styles = {
    match: { background: "rgba(163,230,53,0.08)", color: "#a3e635", border: "1px solid rgba(163,230,53,0.18)" },
    miss:  { background: "rgba(239,68,68,0.08)",  color: "#f87171", border: "1px solid rgba(239,68,68,0.18)" },
  };
  return (
    <span style={{
      ...styles[variant],
      display: "inline-block", fontSize: 12, fontWeight: 500,
      padding: "4px 12px", borderRadius: 100, letterSpacing: "0.02em",
    }}>
      {label}
    </span>
  );
}

// ── Section heading ───────────────────────────────────────────────────
function SectionHead({ label }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 500, letterSpacing: "0.1em",
      textTransform: "uppercase", color: "#4b5568", marginBottom: 12,
    }}>
      {label}
    </p>
  );
}

// ── Divider ───────────────────────────────────────────────────────────
function Divider({ my = 20 }) {
  return <div style={{ height: 1, background: "#1a2236", margin: `${my}px 0` }} />;
}

// ── Main Dashboard ────────────────────────────────────────────────────
export default function Dashboard() {
  const [resumeFile, setResumeFile]       = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult]               = useState(null);
  const [loading, setLoading]             = useState(false);
  const [history, setHistory]             = useState([]);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [dragActive, setDragActive]       = useState(false);
  const [improvedResume, setImprovedResume] = useState("");
  const [aiLoading, setAiLoading]         = useState(false);
  const [error, setError]                 = useState("");
  const [activeTab, setActiveTab]         = useState("input"); 
  const fileInputRef = useRef(null);
  

  const getUserEmailFromToken = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(decodeURIComponent(atob(base64).split("").map(c =>
        "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""))).email;
    } catch { return null; }
  };

  const fetchHistory = async () => {
    try {
      const email = getUserEmailFromToken();
      if (!email) return;
      const res = await axios.get(`http://localhost:3000/api/history/${email}`);
      setHistory(res.data);
    } catch {}
  };

  useEffect(() => { fetchHistory(); }, []);

  const downloadReport = () => {
    if (!result) return;
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(18);
    doc.text("HireSense AI — ATS Report", 20, y); y += 15;
    doc.setFontSize(12);
    doc.text(`ATS Score: ${result.matchScore || 0}%`, 20, y); y += 15;
    const writeList = (title, list) => {
      if (!list?.length) return;
      doc.setFontSize(14); doc.text(title, 20, y); y += 10;
      doc.setFontSize(11);
      list.forEach(item => {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.text(`• ${item}`, 25, y); y += 8;
      });
      y += 8;
    };
    writeList("Strengths:", result.strengths);
    writeList("Missing Skills:", result.missingSkills);
    writeList("Suggestions:", result.suggestions);
    doc.save("HireSense_Report.pdf");
  };

  const analyzeResume = async () => {
    if (loading || !resumeFile || !jobDescription.trim()) return;
    setLoading(true); setResult(null); setError("");
    const steps = ["Uploading resume…", "Extracting text…", "Analysing skills…", "Generating report…"];
    for (const msg of steps) {
      setLoadingMessage(msg);
      await new Promise(r => setTimeout(r, 600));
    }
    try {
      const token = localStorage.getItem("token");
      const email = getUserEmailFromToken();
      const form = new FormData();
      form.append("resume", resumeFile);
      form.append("jobDescription", jobDescription);
      const res = await axios.post("http://localhost:3000/api/analyze", form, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      const analysis = res.data.data;
      setResult(analysis);
      setActiveTab("result");
      if (email) {
        try { await axios.post("http://localhost:3000/api/history/save", { email, result: analysis }); } catch {}
      }
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Analysis failed");
    } finally {
      setLoading(false); setLoadingMessage("");
    }
  };

  const rewriteResume = async () => {
    if (aiLoading || !resumeFile || !jobDescription.trim()) return;
    setAiLoading(true); setError(""); setImprovedResume("");
    try {
      const res = await axios.post("http://localhost:3000/api/ai/rewrite", {
        resumeText: "uploaded resume text here", jobDescription,
      });
      setImprovedResume(res.data.improvedResume);
      setActiveTab("rewrite");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally { setAiLoading(false); }
  };

  const clearAll = () => {
    setResumeFile(null); setJobDescription(""); setResult(null);
    setImprovedResume(""); setError(""); setActiveTab("input");
  };

  // ── shared style tokens ──
  const card = {
    background: "#0d1120", border: "1px solid #1a2236", borderRadius: 14, padding: "24px 28px",
  };
  const innerCard = {
    background: "#111827", border: "1px solid #1e2840", borderRadius: 10, padding: "16px 18px",
  };
  const textInput = {
    width: "100%", background: "#111827", border: "1px solid #1e2840",
    borderRadius: 10, padding: "14px 16px", color: "#e2e8f0",
    fontSize: 14, outline: "none", resize: "vertical", fontFamily: "Inter, sans-serif",
    boxSizing: "border-box",
  };

  return (
    <Layout>
      <div style={{ background: "#080B12", minHeight: "100vh", color: "#e2e8f0", fontFamily: "Inter, sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
          * { box-sizing: border-box; }
          ::placeholder { color: #374151; }
          textarea:focus, input:focus { border-color: #2d3a55 !important; }
          .tab-btn { background: none; border: none; cursor: pointer; font-family: Inter, sans-serif; font-size: 13px; font-weight: 500; padding: 8px 16px; border-radius: 8px; transition: background 0.15s, color 0.15s; }
          .tab-btn.active { background: #1a2236; color: #e2e8f0; }
          .tab-btn:not(.active) { color: #4b5568; }
          .tab-btn:not(.active):hover { color: #94a3b8; }
          .action-btn { width: 100%; padding: 13px 20px; border-radius: 9px; font-size: 14px; font-weight: 500; font-family: Inter, sans-serif; cursor: pointer; transition: background 0.2s, opacity 0.2s, transform 0.15s; border: none; display: flex; align-items: center; justify-content: center; gap: 8px; }
          .action-btn:hover:not(:disabled) { transform: translateY(-1px); }
          .action-btn:disabled { opacity: 0.45; cursor: not-allowed; }
          .action-btn-primary { background: #4F46E5; color: #fff; }
          .action-btn-primary:hover:not(:disabled) { background: #4338CA; }
          .action-btn-secondary { background: #1a2236; color: #94a3b8; }
          .action-btn-secondary:hover:not(:disabled) { background: #1e2840; color: #e2e8f0; }
          .action-btn-ghost { background: transparent; color: #4b5568; border: 1px solid #1a2236 !important; }
          .action-btn-ghost:hover:not(:disabled) { border-color: #2d3a55 !important; color: #94a3b8; }
          .history-row { display: grid; grid-template-columns: 64px 1fr 1fr auto; gap: 16px; align-items: center; padding: 14px 20px; border-bottom: 1px solid #0f1522; transition: background 0.15s; }
          .history-row:last-child { border-bottom: none; }
          .history-row:hover { background: #0d1120; }
          .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.2); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }
          @keyframes spin { to { transform: rotate(360deg); } }
          .drop-zone { border: 1.5px dashed #1e2840; border-radius: 10px; padding: 28px 20px; text-align: center; cursor: pointer; transition: border-color 0.2s, background 0.2s; }
          .drop-zone.active { border-color: #4F46E5; background: rgba(79,70,229,0.06); }
          .drop-zone:hover { border-color: #2d3a55; }
        `}</style>

        {/* Main content */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 40px 80px" }}>

          {/* Page title */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 10, color: "#4F46E5", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Resume Intelligence</p>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, letterSpacing: "-0.025em", color: "#f0eef9", margin: 0 }}>
              Analyse your resume
            </h1>
          </div>

          {/* Two-column layout */}
          <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 20, alignItems: "start" }}>

            {/* ── LEFT: Input panel ── */}
            <div style={{ ...card, display: "flex", flexDirection: "column", gap: 18 }}>

              <p style={{ fontSize: 13, color: "#4b5568", margin: 0 }}>
                Upload a resume and paste a job description to get your ATS score, skill gaps, and targeted edits.
              </p>

              <Divider my={0} />

              {/* Drop zone */}
              <div>
                <SectionHead label="Resume (PDF)" />
                <div
                  className={`drop-zone${dragActive ? " active" : ""}`}
                  onDragEnter={e => { e.preventDefault(); setDragActive(true); }}
                  onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
                  onDrop={e => {
                    e.preventDefault(); setDragActive(false);
                    const f = e.dataTransfer.files[0];
                    if (f?.type === "application/pdf") setResumeFile(f);
                  }}
                  onClick={() => !loading && fileInputRef.current.click()}
                  style={{ opacity: loading ? 0.5 : 1 }}
                >
                  {resumeFile ? (
                    <>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "#a3e635", marginBottom: 4 }}>{resumeFile.name}</p>
                      <p style={{ fontSize: 12, color: "#4b5568" }}>Click or drop to replace</p>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0", marginBottom: 4 }}>Drop PDF here</p>
                      <p style={{ fontSize: 12, color: "#4b5568" }}>or click to browse</p>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" accept=".pdf" hidden disabled={loading}
                    onChange={e => { const f = e.target.files[0]; if (f?.type === "application/pdf") setResumeFile(f); }} />
                </div>
              </div>

              {/* Job description */}
              <div>
                <SectionHead label="Job description" />
                <textarea
                  rows={7}
                  disabled={loading}
                  placeholder="Paste the job description here…"
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  style={{ ...textInput, lineHeight: 1.6 }}
                />
              </div>

              {/* Error */}
              {error && (
                <div style={{ ...innerCard, borderColor: "rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)" }}>
                  <p style={{ fontSize: 13, color: "#f87171", margin: 0 }}>{error}</p>
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button
                  className="action-btn action-btn-primary"
                  onClick={analyzeResume}
                  disabled={loading || !resumeFile || !jobDescription.trim()}
                >
                  {loading ? <><div className="spinner" />{loadingMessage || "Analysing…"}</> : "Analyse resume"}
                </button>

                <button
                  className="action-btn action-btn-secondary"
                  onClick={rewriteResume}
                  disabled={aiLoading || loading || !resumeFile || !jobDescription.trim()}
                >
                  {aiLoading ? <><div className="spinner" />Rewriting…</> : "AI rewrite"}
                </button>

                {(resumeFile || jobDescription || result || improvedResume) && (
                  <button className="action-btn action-btn-ghost" onClick={clearAll} style={{ border: "1px solid #1a2236" }}>
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* ── RIGHT: Result panel ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Tabs — only show if there's something to see */}
              {(result || improvedResume) && (
                <div style={{ display: "flex", gap: 4, background: "#0d1120", border: "1px solid #1a2236", borderRadius: 10, padding: 4, width: "fit-content" }}>
                  <button className={`tab-btn${activeTab === "result" ? " active" : ""}`} onClick={() => setActiveTab("result")}>ATS report</button>
                  {improvedResume && (
                    <button className={`tab-btn${activeTab === "rewrite" ? " active" : ""}`} onClick={() => setActiveTab("rewrite")}>AI rewrite</button>
                  )}
                </div>
              )}

              {/* Empty state */}
              {!result && !improvedResume && (
                <div style={{ ...card, padding: "56px 40px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 4v12M4 10h12" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 500, color: "#374151", marginBottom: 6 }}>No analysis yet</p>
                  <p style={{ fontSize: 13, color: "#1f2937", textAlign: "center", maxWidth: 260 }}>
                    Upload a resume and paste a job description, then click Analyse resume.
                  </p>
                </div>
              )}

              {/* ATS Report */}
              {result && activeTab === "result" && (
                <div style={{ ...card, display: "flex", flexDirection: "column", gap: 24 }}>

                  <ScoreRing score={result.matchScore || 0} />
                  <Divider my={0} />

                  {/* Strengths */}
                  <div>
                    <SectionHead label="Matched skills" />
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {result.strengths?.map((s, i) => <Pill key={i} label={s} variant="match" />)}
                    </div>
                  </div>

                  {/* Missing */}
                  <div>
                    <SectionHead label="Skill gaps" />
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {result.missingSkills?.map((s, i) => <Pill key={i} label={s} variant="miss" />)}
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div style={innerCard}>
                    <SectionHead label="Suggested edits" />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {result.suggestions?.map((s, i) => (
                        <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < result.suggestions.length - 1 ? "1px solid #1a2236" : "none" }}>
                          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#4F46E5", marginTop: 7, flexShrink: 0 }} />
                          <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className="action-btn action-btn-secondary" onClick={downloadReport} style={{ width: "auto", alignSelf: "flex-start", paddingLeft: 20, paddingRight: 20 }}>
                    Download PDF report
                  </button>
                </div>
              )}

              {/* AI Rewrite */}
              {improvedResume && activeTab === "rewrite" && (
                <div style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div>
                      <SectionHead label="AI-optimised resume" />
                      <p style={{ fontSize: 14, fontWeight: 500, color: "#e2e8f0", margin: 0 }}>Tailored to the job description</p>
                    </div>
                    <button
                      className="action-btn action-btn-ghost"
                      onClick={() => navigator.clipboard.writeText(improvedResume)}
                      style={{ width: "auto", padding: "8px 16px", fontSize: 13, border: "1px solid #1a2236" }}
                    >
                      Copy
                    </button>
                  </div>
                  <pre style={{
                    whiteSpace: "pre-wrap", fontSize: 13, color: "#94a3b8",
                    background: "#111827", padding: "18px 20px", borderRadius: 10,
                    border: "1px solid #1e2840", fontFamily: "'IBM Plex Mono', monospace",
                    maxHeight: 480, overflowY: "auto", lineHeight: 1.7, margin: 0,
                  }}>
                    {improvedResume}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* ── History ── */}
          {history.length > 0 && (
            <div style={{ marginTop: 48 }}>
              <Divider my={0} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "28px 0 16px" }}>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", color: "#f0eef9", margin: 0 }}>
                  Past analyses
                </h2>
                <p style={{ fontSize: 12, color: "#4b5568" }}>{history.length} record{history.length !== 1 ? "s" : ""}</p>
              </div>

              <div style={{ ...card, padding: 0, overflow: "hidden" }}>
                {/* Table header */}
                <div style={{ display: "grid", gridTemplateColumns: "64px 1fr 1fr auto", gap: 16, padding: "10px 20px", borderBottom: "1px solid #1a2236" }}>
                  {["Score", "Strengths", "Gaps", "Date"].map(h => (
                    <p key={h} style={{ fontSize: 10, color: "#4b5568", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>{h}</p>
                  ))}
                </div>

                {history.map((item, i) => {
                  const score = item.result?.matchScore;
                  const color = score >= 80 ? "#a3e635" : score >= 60 ? "#f59e0b" : "#f87171";
                  return (
                    <div key={i} className="history-row">
                      <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color }}>{score ?? "—"}%</span>
                      <p style={{ fontSize: 13, color: "#64748b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.result?.strengths?.slice(0, 3).join(", ") || "—"}
                        {item.result?.strengths?.length > 3 ? ` +${item.result.strengths.length - 3}` : ""}
                      </p>
                      <p style={{ fontSize: 13, color: "#64748b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.result?.missingSkills?.slice(0, 3).join(", ") || "—"}
                        {item.result?.missingSkills?.length > 3 ? ` +${item.result.missingSkills.length - 3}` : ""}
                      </p>
                      <p style={{ fontSize: 12, color: "#374151", margin: 0, whiteSpace: "nowrap" }}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
