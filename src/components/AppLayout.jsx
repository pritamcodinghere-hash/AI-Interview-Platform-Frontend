import { useNavigate, useLocation } from "react-router-dom";
import {
  FaSignOutAlt,
} from "react-icons/fa";

// Sidebar items. Keys matching Dashboard's internal modules use query syntax so
// Dashboard can sync to them via useSearchParams.
const MODULES = [
  { key: "overview", label: "Overview", icon: "🏠", to: "/dashboard", color: "#3b82f6" },
  { key: "interview", label: "AI Interview", icon: "🎤", to: "/dashboard?module=interview", color: "#8b5cf6" },
  { key: "coding", label: "Coding Round", icon: "💻", to: "/dashboard?module=coding", color: "#22c55e" },
  { key: "learn", label: "Learn", icon: "📚", to: "/learn", color: "#06b6d4" },
  { key: "weeklytest", label: "Weekly Test", icon: "🏆", to: "/weekly-test", color: "#f59e0b" },
  { key: "reports", label: "Reports", icon: "📊", to: "/dashboard?module=reports", color: "#f59e0b" },
  { key: "resume", label: "Resume Analyzer", icon: "📄", to: "/dashboard?module=resume", color: "#ef4444" },
];

function routeToModule(pathname, search) {
  const p = pathname || "/";
  if (p === "/dashboard") {
    const q = new URLSearchParams(search || "").get("module");
    return ["overview", "interview", "coding", "reports", "resume"].includes(q) ? q : "overview";
  }
  if (p.startsWith("/learn")) return "learn";
  if (p.startsWith("/weekly-test")) return "weeklytest";
  if (p.startsWith("/coding")) return "coding";
  if (p.startsWith("/interview")) return "interview";
  if (p.startsWith("/report")) return "reports";
  if (p.startsWith("/resume")) return "resume";
  return "overview";
}

export default function AppLayout({ children, module, onModuleSelect }) {
  const navigate = useNavigate();
  const location = useLocation();

  let name = "Guest";
  try { name = localStorage.getItem("name") || "Guest"; } catch { /* ignore */ }

  const activeModule = module ?? routeToModule(location.pathname, location.search);

  const logout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("email");
      localStorage.removeItem("name");
    } catch { /* ignore */ }
    navigate("/", { replace: true });
  };

  const handleModule = (key) => {
    if (onModuleSelect) {
      onModuleSelect(key);
      return;
    }
    const target = MODULES.find(m => m.key === key);
    if (target) navigate(target.to);
  };

  return (
    <div className="dashboard">
      <div className="dash-layout">
        <aside className="dash-sidebar">
          <div className="sidebar-greeting">
            <div className="sidebar-avatar">{name[0]?.toUpperCase()}</div>
            <div>
              <div className="sidebar-name">{name}</div>
              <div className="sidebar-role">Placement Prep</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            {MODULES.map(m => (
              <button
                key={m.key}
                className={`sidebar-item ${activeModule === m.key ? "sidebar-active" : ""}`}
                onClick={() => handleModule(m.key)}
              >
                <span className="sidebar-icon">{m.icon}</span>
                <span className="sidebar-label">{m.label}</span>
                {activeModule === m.key && <span className="sidebar-bar" style={{ background: m.color }} />}
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button className="sidebar-link sidebar-logout" onClick={logout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </aside>

        <main className="dash-content">
          {children}
        </main>
      </div>
    </div>
  );
}
