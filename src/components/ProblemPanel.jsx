import { useEffect, useState } from "react";
import questions from "../data/questions";

function ProblemPanel({ question, setQuestion }) {

    const [difficulty, setDifficulty] = useState("Medium");
    const [topic, setTopic] = useState("Java");

    const loadQuestion = () => {

        const filtered = questions.filter(q => {

            const topicMatch =
                topic === "Java" || q.topic === topic;

            return (
                q.difficulty === difficulty &&
                topicMatch
            );

        });

        if (filtered.length === 0) {

            setQuestion("No question found.");

            return;

        }

        const random =
            filtered[Math.floor(Math.random() * filtered.length)];

        setQuestion(random);

    };

    useEffect(() => {

        loadQuestion();

    }, []);

    return (

        <div className="problem-card">

            <div
                style={{
                    display: "flex",
                    gap: "15px",
                    marginBottom: "20px"
                }}
            >

                <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                </select>

                <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                >
                    <option>Java</option>
                    <option>Arrays</option>
                    <option>Strings</option>
                    <option>Linked List</option>
                    <option>Stack</option>
                    <option>Queue</option>
                    <option>HashMap</option>
                    <option>Tree</option>
                    <option>Graph</option>
                    <option>Recursion</option>
                    <option>Dynamic Programming</option>
                </select>

                <button onClick={loadQuestion}>
                    🔄 Next Question
                </button>

            </div>

            {question && (

                <>
                    <h2>{question.title}</h2>

                    <p>{question.problem}</p>

                    <br />

                    <b>Input</b>

                    <pre>{question.input}</pre>

                    <b>Output</b>

                    <pre>{question.output}</pre>

                    <b>Constraints</b>

                    <ul>
                        {question.constraints.map((c, i) => (
                            <li key={i}>{c}</li>
                        ))}
                    </ul>

                </>

            )}

        </div>

    );

}

export default ProblemPanel;