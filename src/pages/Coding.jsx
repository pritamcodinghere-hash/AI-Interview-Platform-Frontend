import { useState } from "react";

import CodingNavbar from "../components/CodingNavbar";
import ProblemPanel from "../components/ProblemPanel";
import TestCasePanel from "../components/TestCasePanel";
import EditorPanel from "../components/EditorPanel";
import ConsolePanel from "../components/ConsolePanel";
import FeedbackPanel from "../components/FeedbackPanel";

import "../styles/Coding.css";

function Coding() {

    const [output, setOutput] = useState("");

    const [input, setInput] = useState("");

    const [question, setQuestion] = useState("");

    return (

        <div className="coding-page">

            <CodingNavbar />

            <div className="coding-main">

                <div className="left-side">

                    <ProblemPanel
                        question={question}
                        setQuestion={setQuestion}
                    />

                </div>

                <div className="right-side">

                    <TestCasePanel
                        question={question}
                    />

                </div>

            </div>

            <EditorPanel
                setOutput={setOutput}
                input={input}
            />

            <ConsolePanel
                output={output}
                input={input}
                setInput={setInput}
            />

            <FeedbackPanel feedback={output} />
        </div>
    );
}

export default Coding;