import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    try {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch {
        // ignore storage errors (private mode / SSR)
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            try {
                localStorage.removeItem("token");
                localStorage.removeItem("email");
                localStorage.removeItem("name");
            } catch {
                // ignore
            }
            if (window.location.pathname !== "/" && window.location.pathname !== "/register") {
                window.location.href = "/";
            }
        }
        return Promise.reject(error);
    }
);

export default api;