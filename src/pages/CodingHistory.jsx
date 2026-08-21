import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function CodingHistory() {

  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const loadHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/coding/attempts");
      setAttempts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || "Unable to load coding history.");
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="container mt-5">

      <div className="d-flex justify-content-between align-items-center mb-4">

        <h2>💻 Coding History</h2>

        <Link
          to="/dashboard"
          className="btn btn-secondary"
        >
          Dashboard
        </Link>

      </div>

      {loading ? <div className="alert alert-info">Loading...</div> : null}
      {error && <div className="alert alert-danger">{typeof error === "string" ? error : JSON.stringify(error)}</div>}
      {!loading && attempts.length === 0 && !error && (
        <div className="alert alert-warning">No Coding Attempts Found.</div>
      )}
      {!loading && attempts.length > 0 && attempts.map((attempt) => (
          <div className="card shadow mb-4" key={attempt.id}>
            <div className="card-body">
              <h5>Coding Question</h5>
              <pre style={{whiteSpace:"pre-wrap"}}>{attempt.question}</pre>
              <hr/>
              <h5>Score</h5>
              <h3 className="text-success">{attempt.score}/100</h3>
              <hr/>
              <h5>Submitted At</h5>
              <p>{attempt.submittedAt}</p>
              <hr/>
              <h5>AI Feedback</h5>
              <pre style={{whiteSpace:"pre-wrap"}}>{attempt.feedback}</pre>
            </div>
          </div>
        ))}

    </div>

  );

}

export default CodingHistory;