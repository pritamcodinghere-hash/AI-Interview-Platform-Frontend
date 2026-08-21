import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Report() {

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const generateReport = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.post("/reports/generate");
            setReport(res.data);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || "Unable to generate report.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        loadLatestReport();

    }, []);

    const loadLatestReport = async () => {
        try {
            const res = await api.get("/reports");
            if (Array.isArray(res.data) && res.data.length > 0) {
                const sorted = [...res.data].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
                setReport(sorted[sorted.length - 1]);
            } else if (res.data && res.data.report) {
                setReport(res.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load reports");
        }
    };

    return (

        <div className="container mt-4">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <h2>📊 Interview Report</h2>

                <Link
                    to="/dashboard"
                    className="btn btn-secondary">

                    Dashboard

                </Link>

            </div>

            <button className="btn btn-primary mb-4" onClick={generateReport} disabled={loading}>
                {loading ? "Generating..." : "Generate AI Report"}
            </button>
            {error && <div className="alert alert-danger">{typeof error === "string" ? error : JSON.stringify(error)}</div>}
            {loading && (

                <div className="alert alert-warning">

                    🤖 Gemini is generating your report...

                </div>

            )}

            {report && (

                <div className="card shadow">

                    <div className="card-body">

                        <h4>Interview Analysis</h4>

                        <hr />

                        <pre
                            style={{
                                whiteSpace: "pre-wrap",
                                fontSize: "15px"
                            }}>

                            {report.report}

                        </pre>

                        <hr />

                        <p>

                            <strong>Generated At :</strong>

                            {" "}

                            {report.createdAt}

                        </p>

                    </div>

                </div>

            )}

        </div>

    );

}

export default Report;