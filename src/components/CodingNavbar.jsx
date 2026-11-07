import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function CodingNavbar() {

    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(id);
    }, []);

    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");

    return (
        <nav className="coding-navbar">

            <div className="coding-brand">
                <span className="logo-badge">⌨️</span>
                <div className="brand-text">
                    <h2>AI Coding Round</h2>
                    <span className="brand-sub">Practice · Learn · Ship</span>
                </div>
            </div>

            <div className="coding-timer" title="Session time">
                <span className="timer-dot" />
                <span className="timer-value">{mm}:{ss}</span>
            </div>

            <div className="coding-links">
                <Link to="/coding-history" className="coding-nav-link">
                    History
                </Link>
                <Link to="/dashboard" className="dashboard-btn">
                    Dashboard
                </Link>
            </div>

        </nav>
    );
}

export default CodingNavbar;
