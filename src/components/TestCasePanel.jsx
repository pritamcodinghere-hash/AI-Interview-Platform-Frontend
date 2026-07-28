import { useState, useEffect } from "react";

function TestCasePanel({ question }) {

    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");

    useEffect(() => {

        if (!question) return;

        setInput(question.input || "No Input");

        setOutput(question.output || "No Output");

    }, [question]);

    return (

        <div className="test-card">

            <h2>🧪 Example Test Case</h2>

            <div className="case-box">

                <h4>Input</h4>

                <pre>{input}</pre>

            </div>

            <div className="case-box">

                <h4>Expected Output</h4>

                <pre>{output}</pre>

            </div>

        </div>

    );

}

export default TestCasePanel;