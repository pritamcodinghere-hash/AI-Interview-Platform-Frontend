import { useState } from "react";
import { useNavigate } from "react-router-dom";

function InterviewSetup() {

  const navigate = useNavigate();

  const [role, setRole] = useState("Java Full Stack Developer");
  const [experience, setExperience] = useState("Fresher");
  const [difficulty, setDifficulty] = useState("Easy");
  const [questions, setQuestions] = useState(10);

  const startInterview = () => {
    navigate("/interview", { state: { role, experience, difficulty, questions: Number(questions) } });
  };

  return (

    <div className="container mt-5">

      <div
        className="card shadow-lg p-5 mx-auto"
        style={{ maxWidth: "700px" }}
      >

        <h2 className="text-center mb-4">
          🎤 AI Interview Setup
        </h2>

        <div className="mb-3">

          <label className="form-label">
            Job Role
          </label>

          <select
            className="form-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >

            <option>Java Full Stack Developer</option>
            <option>Java Backend Developer</option>
            <option>Software Engineer</option>
            <option>AIML Engineer</option>

          </select>

        </div>

        <div className="mb-3">

          <label className="form-label">
            Experience
          </label>

          <select
            className="form-select"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          >

            <option>Fresher</option>
            <option>1-2 Years</option>
            <option>3-5 Years</option>

          </select>

        </div>

        <div className="mb-3">

          <label className="form-label">
            Difficulty
          </label>

          <select
            className="form-select"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >

            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>

          </select>

        </div>

        <div className="mb-4">

          <label className="form-label">
            Number of Questions
          </label>

          <select
            className="form-select"
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
          >

            <option>5</option>
            <option>10</option>
            <option>15</option>

          </select>

        </div>

        <button
          className="btn btn-primary btn-lg"
          onClick={startInterview}
        >

          🚀 Start Interview

        </button>

      </div>

    </div>

  );

}

export default InterviewSetup;