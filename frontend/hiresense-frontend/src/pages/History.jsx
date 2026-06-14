import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const getUserEmailFromToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(
      atob(base64).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
    )).email;
  } catch { return null; }
};

function ScoreBadge({ score }) {
  const color = score >= 80 ? "#a3e635" : score >= 60 ? "#f59e0b" : "#f87171";
  const bg    = score >= 80 ? "rgba(163,230,53,0.08)" : score >= 60 ? "rgba(245,158,11,0.08)" : "rgba(248,113,113,0.08)";
  const border= score >= 80 ? "rgba(163,230,53,0.2)"  : score >= 60 ? "rgba(245,158,11,0.2)"  : "rgba(248,113,113,0.2)";
  return (
    <div style={{
      display: "inline-flex", alignItems: "baseline", gap: 3,
      background: bg, border: `1px solid ${border}`,
      borderRadius: 8, padding: "5px 12px",
    }}>
      <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
      <span style={{ fontSize: 11, color, opacity: 0.7 }}>%</span>
    </div>
  );
}

function Pill({ label, variant }) {
  const styles = {
    match: { background: "rgba(163,230,53,0.08)", color: "#a3e635", border: "1px solid rgba(163,230,53,0.18)" },
    miss:  { background: "rgba(248,113,113,0.08)", color: "#f87171", border: "1px solid rgba(248,113,113,0.18)" },
  };
  return (
    <span style={{ ...styles[variant], display:"inline-block", fontSize:11, fontWeight:500, padding:"3px 10px", borderRadius:100 }}>
      {label}
    </span>
  );
}

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const email = getUserEmailFromToken();
    if (!email) { setLoading(false); return; }
    axios.get(`http://localhost:3000/api/history/${email}`)
      .then(res => setHistory(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 40px 80px", fontFamily: "Inter, sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        .hist-row{cursor:pointer;transition:border-color 0.15s,background 0.15s;}
        .hist-row:hover{border-color:#2d3a55!important;background:#0f1420!important;}
        `}</style>

        {/* Page header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize:10, color:"#4F46E5", fontWeight:500, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8 }}>
            Resume Intelligence
          </p>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:32, fontWeight:800, letterSpacing:"-0.025em", color:"#f0eef9", margin:0 }}>
              Analysis history
            </h1>
            {history.length > 0 && (
              <p style={{ fontSize:13, color:"#374151", margin:0 }}>{history.length} record{history.length !== 1 ? "s" : ""}</p>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display:"flex", alignItems:"center", gap:10, color:"#374151", fontSize:13 }}>
            <div style={{ width:14, height:14, border:"2px solid #1a2236", borderTopColor:"#4F46E5", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
            Loading history…
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* Empty state */}
        {!loading && history.length === 0 && (
          <div style={{
            background:"#0d1120", border:"1px solid #1a2236", borderRadius:14,
            padding:"56px 40px", display:"flex", flexDirection:"column", alignItems:"center",
          }}>
            <div style={{ width:48, height:48, borderRadius:12, background:"#111827", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="4" y="2" width="12" height="16" rx="2" stroke="#374151" strokeWidth="1.5"/>
                <path d="M7 7h6M7 10h4" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p style={{ fontSize:15, fontWeight:500, color:"#374151", marginBottom:6 }}>No analyses yet</p>
            <p style={{ fontSize:13, color:"#1f2937", textAlign:"center", maxWidth:260 }}>
              Head to the dashboard, upload a resume, and run your first analysis.
            </p>
          </div>
        )}

        {/* History list */}
        {!loading && history.length > 0 && (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {history.map((item, i) => {
              const score    = item.result?.matchScore ?? 0;
              const strengths = item.result?.strengths || [];
              const missing   = item.result?.missingSkills || [];
              const suggestions = item.result?.suggestions || [];
              const date     = item.createdAt ? new Date(item.createdAt) : null;
              const isOpen   = expanded === i;

              return (
                <div
                  key={i}
                  className="hist-row"
                  onClick={() => setExpanded(isOpen ? null : i)}
                  style={{
                    background: isOpen ? "#0f1420" : "#0d1120",
                    border: `1px solid ${isOpen ? "#2d3a55" : "#1a2236"}`,
                    borderRadius: 12, overflow: "hidden",
                  }}
                >
                  {/* Row summary */}
                  <div style={{ display:"grid", gridTemplateColumns:"auto 1fr auto", gap:20, alignItems:"center", padding:"16px 20px" }}>
                    <ScoreBadge score={score} />

                    <div style={{ minWidth:0 }}>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:6 }}>
                        {strengths.slice(0,4).map(s => <Pill key={s} label={s} variant="match" />)}
                        {strengths.length > 4 && (
                          <span style={{ fontSize:11, color:"#374151", alignSelf:"center" }}>+{strengths.length - 4}</span>
                        )}
                      </div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                        {missing.slice(0,3).map(s => <Pill key={s} label={s} variant="miss" />)}
                        {missing.length > 3 && (
                          <span style={{ fontSize:11, color:"#374151", alignSelf:"center" }}>+{missing.length - 3}</span>
                        )}
                      </div>
                    </div>

                    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6, flexShrink:0 }}>
                      {date && (
                        <p style={{ fontSize:12, color:"#374151", margin:0, whiteSpace:"nowrap" }}>
                          {date.toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}
                        </p>
                      )}
                      <svg
                        width="14" height="14" viewBox="0 0 14 14" fill="none"
                        style={{ color:"#374151", transform: isOpen ? "rotate(180deg)" : "none", transition:"transform 0.2s" }}
                      >
                        <path d="M2 4.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div style={{ borderTop:"1px solid #1a2236", padding:"20px 20px 24px" }}>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom: suggestions.length ? 16 : 0 }}>

                        {strengths.length > 0 && (
                          <div style={{ background:"#111827", border:"1px solid #1e2840", borderRadius:10, padding:"14px 16px" }}>
                            <p style={{ fontSize:10, color:"#4b5568", fontWeight:500, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>
                              Matched skills
                            </p>
                            <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                              {strengths.map(s => <Pill key={s} label={s} variant="match" />)}
                            </div>
                          </div>
                        )}

                        {missing.length > 0 && (
                          <div style={{ background:"#111827", border:"1px solid #1e2840", borderRadius:10, padding:"14px 16px" }}>
                            <p style={{ fontSize:10, color:"#4b5568", fontWeight:500, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>
                              Skill gaps
                            </p>
                            <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                              {missing.map(s => <Pill key={s} label={s} variant="miss" />)}
                            </div>
                          </div>
                        )}
                      </div>

                      {suggestions.length > 0 && (
                        <div style={{ background:"#111827", border:"1px solid #1e2840", borderRadius:10, padding:"14px 16px" }}>
                          <p style={{ fontSize:10, color:"#4b5568", fontWeight:500, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>
                            Suggestions
                          </p>
                          {suggestions.map((s, j) => (
                            <div key={j} style={{ display:"flex", gap:10, padding:"6px 0", borderBottom: j < suggestions.length-1 ? "1px solid #1a2236" : "none" }}>
                              <div style={{ width:4, height:4, borderRadius:"50%", background:"#4F46E5", marginTop:6, flexShrink:0 }} />
                              <p style={{ fontSize:13, color:"#94a3b8", margin:0, lineHeight:1.6 }}>{s}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
