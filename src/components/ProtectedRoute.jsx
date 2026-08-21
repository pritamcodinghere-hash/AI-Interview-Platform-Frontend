import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  let token = null;
  try {
    token = localStorage.getItem("token");
  } catch {
    token = null;
  }
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default ProtectedRoute;
