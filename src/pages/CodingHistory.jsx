import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function CodingHistory() {

  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {

    try {

      const res = await api.get("/coding/attempts");

      setAttempts(res.data);

    } catch (err) {

      console.log(err);

      alert("Unable to load coding history.");

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

      {attempts.length === 0 ? (

        <div className="alert alert-warning">

          No Coding Attempts Found.

        </div>

      ) : (

        attempts.map((attempt) => (

          <div
            className="card shadow mb-4"
            key={attempt.id}
          >

            <div className="card-body">

              <h5>Coding Question</h5>

              <pre style={{whiteSpace:"pre-wrap"}}>
                {attempt.question}
              </pre>

              <hr/>

              <h5>Score</h5>

              <h3 className="text-success">
                {attempt.score}/100
              </h3>

              <hr/>

              <h5>Submitted At</h5>

              <p>{attempt.submittedAt}</p>

              <hr/>

              <h5>AI Feedback</h5>

              <pre style={{whiteSpace:"pre-wrap"}}>
                {attempt.feedback}
              </pre>

            </div>

          </div>

        ))

      )}

    </div>

  );

}

export default CodingHistory;