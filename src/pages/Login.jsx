import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

import "../styles/Auth.css";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const [loading, setLoading] = useState(false);

    const login = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setMessage("");
        try {
            const res = await api.post("/auth/login", { email, password });
            if (res.data.token) {
                try {
                    localStorage.setItem("token", res.data.token);
                    localStorage.setItem("email", res.data.email || email);
                    localStorage.setItem("name", res.data.fullName || email);
                } catch {
                    // storage failed
                }
                navigate("/dashboard");
            } else {
                setMessage(res.data.message || "Login failed");
            }
        } catch (err) {
            const status = err.response?.status;
            const serverMsg = err.response?.data?.message || err.response?.data;
            if (status === 401 || status === 404) {
                setMessage(typeof serverMsg === "string" ? serverMsg : "Invalid Email or Password");
            } else if (!err.response) {
                setMessage("Network error. Please check server.");
            } else {
                setMessage(typeof serverMsg === "string" ? serverMsg : "Login failed. Try again.");
            }
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

                        Crack your next

                        <br />

                        <span className="grad-text">interview with AI.</span>

                    </h1>

                    <p>

                        Practice mock interviews, solve DSA problems and get

                        instant AI feedback on your resume — all in one place.

                    </p>

                    <ul className="auth-points">

                        <li>

                            <span className="pt-icon">🎤</span>

                            Live AI mock interviews with real-time scoring

                        </li>

                        <li>

                            <span className="pt-icon">💻</span>

                            Coding arena with AI explain, debug and hints

                        </li>

                        <li>

                            <span className="pt-icon">📄</span>

                            Resume ATS analysis with hiring suggestions

                        </li>

                    </ul>

                </div>

                <div className="auth-hero-footer">

                    <span className="live-dot" />

                    Spring Boot + React + OpenRouter AI

                </div>

            </aside>

            <main className="auth-form-side">

                <div className="auth-card">

                    <span className="auth-kicker">✦ Welcome back</span>

                    <h2>Sign in</h2>

                    <p className="auth-sub">

                        Enter your credentials to access your dashboard.

                    </p>

                    <form onSubmit={login}>

                        <div className="field">

                            <label htmlFor="login-email">Email</label>

                            <input
                                id="login-email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                        </div>

                        <div className="field">

                            <label htmlFor="login-password">Password</label>

                            <input
                                id="login-password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                        </div>

                        {message && (

                            <div className="alert alert-danger-custom auth-alert">

                                {message}

                            </div>

                        )}

                        <button
                            className="btn-grad btn-block auth-submit"
                            type="submit"
                            disabled={loading}>

                            {loading ? (

                                <>

                                    <span className="btn-spinner" />

                                    Signing in...

                                </>

                            ) : (

                                "Sign in →"

                            )}

                        </button>

                    </form>

                    <div className="auth-divider">New here?</div>

                    <div className="auth-switch">

                        Don&apos;t have an account?{" "}

                        <Link to="/register">

                            Create one free

                        </Link>

                    </div>

                </div>

            </main>

        </div>

    );

}

export default Login;