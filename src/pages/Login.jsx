import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const login = async (e) => {

        e.preventDefault();

        try {

            const res = await api.post("/auth/login", {

                email,
                password

            });

            console.log(res.data);

            if (res.data.token) {

                // Remove old token
                localStorage.removeItem("token");

                // Save new token
                localStorage.setItem("token", res.data.token);

                localStorage.setItem("email", res.data.email);

                localStorage.setItem("name", res.data.fullName);

                alert("Login Successful");

                navigate("/dashboard");

            } else {

                setMessage(res.data.message);

            }

        } catch (err) {

            console.log(err);

            setMessage("Invalid Email or Password");

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
                                    type="submit">

                                    Login

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