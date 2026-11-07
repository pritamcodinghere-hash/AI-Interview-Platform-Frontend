import { FaBell, FaSignOutAlt } from "react-icons/fa";

import { useNavigate, Link, useLocation } from "react-router-dom";

const LINKS = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/interview", label: "Interview" },
    { to: "/coding", label: "Coding" },
    { to: "/report", label: "Reports" },
    { to: "/resume", label: "Resume" },
];

function Navbar() {
    let name;
    try {
        name = localStorage.getItem("name") || "Guest";
    } catch {
        name = "Guest";
    }
    const navigate = useNavigate();
    const location = useLocation();

    const initial = (name.trim()[0] || "G").toUpperCase();

    const logout = () => {
        try {
            localStorage.removeItem("token");
            localStorage.removeItem("email");
            localStorage.removeItem("name");
        } catch {
            // ignore
        }
        navigate("/", { replace: true });
    };

    return (

        <nav className="navbar">

            <div className="nav-left">

                <Link to="/dashboard" className="logo">

                    <span className="logo-badge">🤖</span>

                    AI Interview Platform

                </Link>

                <div className="nav-links">

                    {LINKS.map((link) => (

                        <Link
                            key={link.to}
                            to={link.to}
                            className={`nav-link${location.pathname === link.to ? " active" : ""}`}
                        >

                            {link.label}

                        </Link>

                    ))}

                </div>

            </div>

            <div className="nav-right">

                <button className="nav-icon" aria-label="Notifications" type="button">

                    <FaBell />

                </button>

                <div className="profile" title={name}>

                    <span className="avatar">{initial}</span>

                    <span>{name}</span>

                </div>

                <button

                    className="logout-btn"

                    onClick={logout}

                >

                    <FaSignOutAlt/>

                    <span>Logout</span>

                </button>

            </div>

        </nav>

    );

}

export default Navbar;
