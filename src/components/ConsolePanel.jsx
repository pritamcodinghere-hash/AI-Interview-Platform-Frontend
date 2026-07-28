function ConsolePanel({ output, input, setInput }) {

    return (

        <div className="console-card">

            <h2>🖥 Console Output</h2>

            <div className="input-section">

                <h3>Custom Input</h3>

                <textarea
                    value={input}
                    onChange={(e)=>setInput(e.target.value)}
                    placeholder="Enter input here..."
                    rows={4}
                />

            </div>

            <div className="output-section">

                <h3>Output</h3>

                <pre>{output}</pre>

            </div>

        </div>

    );

}

export default ConsolePanel;