import { FaBell, FaUserCircle, FaSignOutAlt } from "react-icons/fa";

function Navbar() {

    const name = localStorage.getItem("name") || "Happy";

    const logout = () => {
        localStorage.clear();
        window.location.href = "/";
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