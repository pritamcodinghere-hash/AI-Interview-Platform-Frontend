import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

import "../styles/Auth.css";

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
    <div className="auth-page">

      <aside className="auth-hero">
        <span className="auth-orb orb-1" />
        <span className="auth-orb orb-2" />

        <div className="auth-brand">
          <span className="logo-badge">🤖</span>
          AI Interview Platform
        </div>

        <div className="auth-hero-content">
          <h1>
            Start your journey to
            <br />
            <span className="grad-text">your dream job.</span>
          </h1>
          <p>
            Create a free account and unlock AI interviews, coding practice
            and personalized resume feedback.
          </p>
          <ul className="auth-points">
            <li>
              <span className="pt-icon">⚡</span>
              Free forever — no credit card needed
            </li>
            <li>
              <span className="pt-icon">📊</span>
              Track scores, streaks and progress over time
            </li>
            <li>
              <span className="pt-icon">🧠</span>
              Personalized AI feedback after every session
            </li>
          </ul>
        </div>

        <div className="auth-hero-footer">
          <span className="live-dot" />
          Joined by 10,000+ candidates preparing right now
        </div>
      </aside>

      <main className="auth-form-side">
        <div className="auth-card">
          <span className="auth-kicker">✦ Get started</span>
          <h2>Create account</h2>
          <p className="auth-sub">
            Takes less than a minute. Then straight to practicing.
          </p>

          <form onSubmit={register}>
            <div className="field">
              <label htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {message && (
              <div className="alert alert-danger-custom auth-alert">{message}</div>
            )}

            <button
              className="btn-grad btn-block auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  Creating account...
                </>
              ) : (
                "Create account →"
              )}
            </button>
          </form>

          <div className="auth-divider">Already registered?</div>

          <div className="auth-switch">
            Have an account? <Link to="/">Sign in</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Register;