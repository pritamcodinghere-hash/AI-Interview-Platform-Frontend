
function FeedbackPanel({ feedback }) {

    return (

        <div className="feedback-card">

            <div className="feedback-header">

                <h2>🤖 AI Feedback</h2>

            </div>

            <div className="feedback-body">

                <pre>
                    {feedback
                        ? feedback
                        : "AI feedback will appear here after clicking 'AI Explain' or 'Submit'."}
                </pre>

            </div>

        </div>

    );

}

export default FeedbackPanel;