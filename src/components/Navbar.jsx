import { FaBell, FaUserCircle, FaSignOutAlt } from "react-icons/fa";

import { useNavigate } from "react-router-dom";

function Navbar() {
    let name = "Happy";
    try {
        name = localStorage.getItem("name") || "Happy";
    } catch {
        name = "Happy";
    }
    const navigate = useNavigate();

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

            <div className="logo">
                🤖 AI Interview Platform
            </div>

            <div className="nav-right">

                <FaBell className="nav-icon"/>

                <div className="profile">

                    <FaUserCircle/>

                    <span>{name}</span>

                </div>

                <button
                    className="logout-btn"
                    onClick={logout}
                >

                    <FaSignOutAlt/>

                    Logout

                </button>

            </div>

        </nav>

    );

}

export default Navbar;