function RecentActivity() {

    const activities = [

        "🎤 Completed HR Interview",

        "💻 Solved Two Sum",

        "📊 AI Score: 92%",

        "📄 Report Generated",

        "🧠 Practiced OOPS Questions"

    ];

    return (

        <div className="activity-card">

            <h2>📅 Recent Activity</h2>

            <ul>

                {

                    activities.map((item,index)=>(

                        <li key={index}>

                            {item}

                        </li>

                    ))

                }

            </ul>

        </div>

    );

}

export default RecentActivity;