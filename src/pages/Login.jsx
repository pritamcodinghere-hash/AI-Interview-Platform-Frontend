import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

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

        <div className="container mt-5">

            <div className="row justify-content-center">

                <div className="col-md-5">

                    <div className="card shadow">

                        <div className="card-body">

                            <h2 className="text-center mb-4">
                                AI Interview Platform
                            </h2>

                            <form onSubmit={login}>

                                <div className="mb-3">

                                    <label>Email</label>

                                    <input
                                        type="email"
                                        className="form-control"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />

                                </div>

                                <div className="mb-3">

                                    <label>Password</label>

                                    <input
                                        type="password"
                                        className="form-control"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />

                                </div>

                                <button
                                    className="btn btn-primary w-100"
                                    type="submit"
                                    disabled={loading}>

                                    {loading ? "Logging in..." : "Login"}

                                </button>

                            </form>

                            {message && (

                                <div className="alert alert-danger mt-3">

                                    {message}

                                </div>

                            )}

                            <div className="text-center mt-3">

                                Don't have an account?

                                <Link to="/register">

                                    Register

                                </Link>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Login;