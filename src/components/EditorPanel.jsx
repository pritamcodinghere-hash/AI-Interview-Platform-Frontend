import { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import api from "../services/api";

function EditorPanel({ setOutput, input }) {

    const [language, setLanguage] = useState("java");
    const [theme, setTheme] = useState("vs-dark");

    const defaultCode = `import java.util.*;

public class Solution {

    public static void main(String[] args){

        Scanner sc = new Scanner(System.in);

        String s = sc.nextLine();

        System.out.println(new StringBuilder(s).reverse());

    }

}`;

    const [code, setCode] = useState(defaultCode);
    const abortRef = useRef(null);
    const [running, setRunning] = useState(false);

    const callAI = async (endpoint, loadingMessage) => {
        if (running) return;
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setRunning(true);
        try {
            setOutput(loadingMessage);
            const response = await api.post(`/gemini/${endpoint}`, { code, language }, { signal: controller.signal, timeout: 30000 });
            setOutput(typeof response.data === "string" ? response.data : JSON.stringify(response.data, null, 2));
        } catch (err) {
            if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
                setOutput("Request cancelled");
            } else if (err.response) {
                const data = err.response.data;
                setOutput(typeof data === "string" ? data : JSON.stringify(data, null, 2));
            } else {
                setOutput(err.message);
            }
        } finally {
            setRunning(false);
        }
    };

    const runCode = async () => {
        if (running) return;
        setRunning(true);
        try {
            const response = await api.post("/compiler/run", { code, input, language }, { timeout: 15000 });
            const out = response.data.output ?? response.data;
            setOutput("🟢 Program Output\n\n" + (typeof out === "string" ? out : JSON.stringify(out, null, 2)));
        } catch (err) {
            if (err.response) {
                setOutput(JSON.stringify(err.response.data, null, 2));
            } else {
                setOutput(err.message);
            }
        } finally {
            setRunning(false);
        }
    };

    const submitCode = async () => {
        if (running) return;
        setRunning(true);
        try {
            const response = await api.post("/submission", { code, language });

            let result = "";

            result += "🎯 Submission Result\n\n";

            result +=
                `Passed : ${response.data.passed} / ${response.data.total}\n\n`;

            response.data.results.forEach((test, index) => {

                result +=
`=====================
Test Case ${index + 1}
${test.passed ? "✅ PASSED" : "❌ FAILED"}

Input : ${test.input}

Expected : ${test.expected}

Actual : ${test.actual}


`;

            });

            setOutput(result);

        } catch (err) {
            if (err.response) {
                setOutput(JSON.stringify(err.response.data, null, 2));
            } else {
                setOutput(err.message);
            }
        } finally {
            setRunning(false);
        }
    };
        // ================= AI BUTTONS =================

    const explainCode = () =>
        callAI("explain", "🤖 Explaining Code...");

    const optimizeCode = () =>
        callAI("optimize", "⚡ Optimizing Code...");

    const findBugs = () =>
        callAI("bugs", "🐞 Finding Bugs...");

    const generateTestCases = () =>
        callAI("testcases", "🧪 Generating Test Cases...");

    const analyzeComplexity = () =>
        callAI("complexity", "📊 Analyzing Time & Space Complexity...");

    const dryRun = () =>
        callAI("dryrun", "🔍 Performing Dry Run...");

    const getHint = () =>
        callAI("hint", "💡 Generating Hint...");

    // ================= RESET =================

    const resetCode = () => {

        setCode(defaultCode);

        setOutput("Editor Reset Successfully.");

    };

    // ================= UI =================

    return (

        <div className="editor-card">

            <div className="editor-top">

                <div className="editor-left">

                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                    >
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                    </select>

                    <select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                    >
                        <option value="vs-dark">Dark</option>
                        <option value="light">Light</option>
                    </select>

                </div>

                <div className="editor-right">
                    <button className="run-btn" onClick={runCode} disabled={running}>
                        ▶ {running ? "..." : "Run"}
                    </button>

                    <button className="submit-btn" onClick={submitCode} disabled={running}>
                        🚀 Submit
                    </button>

                    <button
                        className="ai-btn"
                        onClick={explainCode}
                    >
                        🤖 Explain
                    </button>

                    <button
                        className="ai-btn"
                        onClick={optimizeCode}
                    >
                        ⚡ Optimize
                    </button>

                    <button
                        className="ai-btn"
                        onClick={findBugs}
                    >
                        🐞 Bugs
                    </button>

                    <button
                        className="ai-btn"
                        onClick={generateTestCases}
                    >
                        🧪 Test Cases
                    </button>

                    <button
                        className="ai-btn"
                        onClick={analyzeComplexity}
                    >
                        📊 Complexity
                    </button>

                    <button
                        className="ai-btn"
                        onClick={dryRun}
                    >
                        🔍 Dry Run
                    </button>

                    <button
                        className="ai-btn"
                        onClick={getHint}
                    >
                        💡 Hint
                    </button>

                    <button
                        className="reset-btn"
                        onClick={resetCode}
                    >
                        🔄 Reset
                    </button>

                </div>

            </div>
                        <Editor
                height="600px"
                language={language}
                theme={theme}
                value={code}
                onChange={(value) => setCode(value || "")}
                options={{
                    fontSize: 16,
                    minimap: {
                        enabled: false,
                    },
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                }}
            />

        </div>

    );

}

export default EditorPanel;
    