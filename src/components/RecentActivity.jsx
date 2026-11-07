function RecentActivity({ activities }) {
    const items = activities && activities.length
        ? activities
        : [{ dot: "", text: "No activity yet — start practicing!" }];

    return (
        <div className="activity-card">
            <h2>📅 Recent Activity</h2>
            <ul>
                {items.map((item, index) => (
                    <li key={index}>
                        <span className={`activity-dot ${item.color || item.dot || ""}`} />
                        {item.icon ? `${item.icon} ` : ""}{item.text}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default RecentActivity;
