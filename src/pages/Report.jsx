import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Report() {

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);

    const generateReport = async () => {

        setLoading(true);

        try {

            const res = await api.post("/reports/generate");

            setReport(res.data);

        } catch (err) {

            alert("Unable to generate report.");

            console.log(err);

        }

        setLoading(false);

    };

    useEffect(() => {

        loadLatestReport();

    }, []);

    const loadLatestReport = async () => {

        try {

            const res = await api.get("/reports");

            if (res.data.length > 0) {

                setReport(res.data[res.data.length - 1]);

            }

        } catch (err) {

            console.log(err);

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

            <button
                className="btn btn-primary mb-4"
                onClick={generateReport}>

                Generate AI Report

            </button>

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