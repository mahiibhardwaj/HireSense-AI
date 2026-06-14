import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const validateEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const validatePassword = p => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(p);

const requirements = [
  { label: "8+ characters",        test: p => p.length >= 8 },
  { label: "Uppercase letter",     test: p => /[A-Z]/.test(p) },
  { label: "Lowercase letter",     test: p => /[a-z]/.test(p) },
  { label: "Number",               test: p => /\d/.test(p) },
  { label: "Special character",    test: p => /[@$!%*?&]/.test(p) },
];

export default function Register() {
  const navigate = useNavigate();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [pwFocused, setPwFocused] = useState(false);
  const [errors, setErrors]     = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading]   = useState(false);

  const validate = () => {
    const e = {};
    if (!name.trim())           e.name = "Name is required.";
    if (!email.trim())          e.email = "Email is required.";
    else if (!validateEmail(email)) e.email = "Enter a valid email address.";
    if (!password)              e.password = "Password is required.";
    else if (!validatePassword(password)) e.password = "Password doesn't meet all requirements.";
    return e;
  };

  const handleRegister = async () => {
    setServerError("");
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    try {
      setLoading(true);
      await axios.post("http://localhost:3000/api/auth/register", { name, email, password });
      navigate("/dashboard");
    } catch (err) {
      setServerError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const strength = requirements.filter(r => r.test(password)).length;
  const strengthColor = strength <= 1 ? "#ef4444" : strength <= 3 ? "#f59e0b" : "#a3e635";
  const strengthLabel = strength <= 1 ? "Weak" : strength <= 3 ? "Fair" : strength === 5 ? "Strong" : "Good";

  return (
    <div style={s.page}>
      <style>{fonts}</style>
      <div style={s.card}>

        {/* Logo */}
        <Link to="/" style={s.logo}>
          <div style={s.logoMark}>H</div>
          <span style={s.logoText}>HireSense AI</span>
        </Link>

        <div style={{ marginBottom: 28 }}>
          <h1 style={s.heading}>Create your account</h1>
          <p style={s.sub}>Start analysing resumes in under a minute.</p>
        </div>

        {serverError && <div style={s.errorBox}>{serverError}</div>}

        {/* Name */}
        <div style={s.fieldGroup}>
          <label style={s.label}>Full name</label>
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: "" })); }}
            placeholder="Alex Johnson"
            style={{ ...s.input, ...(errors.name ? s.inputError : {}) }}
          />
          {errors.name && <p style={s.fieldError}>{errors.name}</p>}
        </div>

        {/* Email */}
        <div style={s.fieldGroup}>
          <label style={s.label}>Email</label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }}
            placeholder="you@example.com"
            style={{ ...s.input, ...(errors.email ? s.inputError : {}) }}
          />
          {errors.email && <p style={s.fieldError}>{errors.email}</p>}
        </div>

        {/* Password */}
        <div style={{ ...s.fieldGroup, marginBottom: 24 }}>
          <label style={s.label}>Password</label>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }}
            onFocus={() => setPwFocused(true)}
            placeholder="••••••••"
            style={{ ...s.input, ...(errors.password ? s.inputError : {}) }}
          />
          {errors.password && <p style={s.fieldError}>{errors.password}</p>}

          {/* Strength bar — only when typing */}
          {(pwFocused || password) && (
            <div style={{ marginTop: 10 }}>
              {/* Bar */}
              <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{
                    flex: 1, height: 3, borderRadius: 2,
                    background: i <= strength ? strengthColor : "#1a2236",
                    transition: "background 0.25s",
                  }} />
                ))}
              </div>
              {/* Checklist */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 12px" }}>
                {requirements.map(r => {
                  const met = r.test(password);
                  return (
                    <span key={r.label} style={{
                      fontSize: 11, color: met ? "#a3e635" : "#374151",
                      display: "flex", alignItems: "center", gap: 4, transition: "color 0.2s",
                    }}>
                      <span style={{ fontSize: 9 }}>{met ? "✓" : "○"}</span>
                      {r.label}
                    </span>
                  );
                })}
              </div>
              {password && (
                <p style={{ fontSize: 11, color: strengthColor, marginTop: 6 }}>
                  {strengthLabel} password
                </p>
              )}
            </div>
          )}
        </div>

        <button onClick={handleRegister} disabled={loading} style={s.btn}>
          {loading ? <><div style={s.spinner} />Creating account…</> : "Create account"}
        </button>

        <p style={s.footer}>
          Already have an account?{" "}
          <Link to="/login" style={s.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const fonts = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Syne:wght@700;800&display=swap');
*{box-sizing:border-box;}
input::placeholder{color:#2d3a55;}
input:focus{border-color:#4F46E5!important;outline:none;}
@keyframes spin{to{transform:rotate(360deg)}}
`;

const s = {
  page: {
    minHeight: "100vh", background: "#080B12", display: "flex",
    alignItems: "center", justifyContent: "center",
    fontFamily: "Inter, sans-serif", padding: "24px 16px",
  },
  card: {
    width: "100%", maxWidth: 400,
    background: "#0d1120", border: "1px solid #1a2236",
    borderRadius: 16, padding: "36px 32px",
  },
  logo: {
    display: "flex", alignItems: "center", gap: 8,
    textDecoration: "none", marginBottom: 32,
  },
  logoMark: {
    width: 26, height: 26, background: "#4F46E5", borderRadius: 6,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 700, color: "#fff",
  },
  logoText: { fontSize: 14, fontWeight: 600, color: "#e2e8f0", letterSpacing: "-0.01em" },
  heading: {
    fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800,
    letterSpacing: "-0.025em", color: "#f0eef9", margin: "0 0 6px",
  },
  sub: { fontSize: 13, color: "#4b5568", margin: 0 },
  errorBox: {
    background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)",
    borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#f87171", marginBottom: 18,
  },
  fieldGroup: { marginBottom: 16 },
  label: {
    display: "block", fontSize: 12, fontWeight: 500, color: "#64748b",
    letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 7,
  },
  input: {
    width: "100%", background: "#111827", border: "1px solid #1e2840",
    borderRadius: 9, padding: "12px 14px", color: "#e2e8f0", fontSize: 14,
    fontFamily: "Inter, sans-serif", transition: "border-color 0.15s",
  },
  inputError: { borderColor: "rgba(239,68,68,0.4) !important" },
  fieldError: { fontSize: 12, color: "#f87171", margin: "5px 0 0" },
  btn: {
    width: "100%", background: "#4F46E5", color: "#fff", border: "none",
    borderRadius: 9, padding: "13px 20px", fontSize: 14, fontWeight: 500,
    fontFamily: "Inter, sans-serif", cursor: "pointer", display: "flex",
    alignItems: "center", justifyContent: "center", gap: 8,
    transition: "background 0.2s", marginBottom: 20,
  },
  spinner: {
    width: 15, height: 15, border: "2px solid rgba(255,255,255,0.25)",
    borderTopColor: "#fff", borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  footer: { fontSize: 13, color: "#374151", textAlign: "center", margin: 0 },
  link: { color: "#4F46E5", textDecoration: "none", fontWeight: 500 },
};
