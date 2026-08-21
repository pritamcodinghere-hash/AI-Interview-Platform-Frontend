import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!fullName.trim() || fullName.trim().length < 2) return "Full name must be at least 2 characters";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email format";
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const register = async (e) => {
    e.preventDefault();
    const errMsg = validate();
    if (errMsg) {
      setMessage(errMsg);
      return;
    }
    if (loading) return;
    setLoading(true);
    setMessage("");
    try {
      await api.post("/auth/register", { fullName: fullName.trim(), email: email.trim(), password });
      navigate("/");
    } catch (err) {
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message || err.response?.data;
      if (status === 409) setMessage("Email already registered");
      else if (status === 400) setMessage(typeof serverMsg === "string" ? serverMsg : "Invalid registration data");
      else if (!err.response) setMessage("Network error. Please check server.");
      else setMessage(typeof serverMsg === "string" ? serverMsg : "Registration Failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="text-center mb-4">Register</h2>
              <form onSubmit={register}>
                <div className="mb-3">
                  <label>Full Name</label>
                  <input type="text" className="form-control" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label>Email</label>
                  <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label>Password</label>
                  <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {message && <div className="alert alert-danger">{message}</div>}
                <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                  {loading ? "Registering..." : "Register"}
                </button>
              </form>
              <div className="text-center mt-3">
                Already have an account? <Link to="/">Login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;