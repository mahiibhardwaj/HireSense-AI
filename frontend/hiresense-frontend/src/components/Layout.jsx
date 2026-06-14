import { useNavigate, useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const path      = location.pathname;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navItem = (label, to) => {
    const active = path === to;
    return (
      <button
        onClick={() => navigate(to)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 500,
          color: active ? "#e2e8f0" : "#4b5568",
          padding: "6px 12px", borderRadius: 7,
          background: active ? "#1a2236" : "transparent",
          transition: "color 0.15s, background 0.15s",
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#94a3b8"; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.color = "#4b5568"; }}
      >
        {label}
      </button>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080B12", fontFamily: "Inter, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Syne:wght@700;800&display=swap');`}</style>

      {/* Navbar */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px", height: 56,
        borderBottom: "1px solid #0f1522",
        background: "rgba(8,11,18,0.92)",
        backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 50,
      }}>

        {/* Logo */}
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "none", border: "none", cursor: "pointer", padding: 0,
          }}
        >
          <div style={{
            width: 26, height: 26, background: "#4F46E5", borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
          }}>H</div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", letterSpacing: "-0.01em" }}>
            HireSense AI
          </span>
        </button>

        {/* Nav links + logout */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {navItem("Dashboard", "/dashboard")}
          {navItem("History", "/history")}

          <div style={{ width: 1, height: 16, background: "#1a2236", margin: "0 8px" }} />

          <button
            onClick={handleLogout}
            style={{
              background: "none", border: "1px solid #1a2236", cursor: "pointer",
              fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 500,
              color: "#4b5568", padding: "6px 14px", borderRadius: 7,
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "#ef4444";
              e.currentTarget.style.color = "#f87171";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "#1a2236";
              e.currentTarget.style.color = "#4b5568";
            }}
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Page content — no extra padding, pages own their spacing */}
      {children}
    </div>
  );
}
