import { Link } from "react-router-dom";

function CodingNavbar() {
  return (
    <nav>
      <h2>AI Coding Round</h2>

      <Link to="/dashboard">
        Dashboard
      </Link>
    </nav>
  );
}

export default CodingNavbar;