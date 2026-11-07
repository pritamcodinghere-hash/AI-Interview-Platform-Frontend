function StreakCard({
  streakDays = 0,
  problemsSolved = 0,
  totalProblems = 150,
  weeklyGoal = 20,
  goalStatus = "Not started",
  nextMilestone = 10,
}) {
  const pct = totalProblems > 0 ? Math.min(100, Math.round((problemsSolved / totalProblems) * 100)) : 0;

  return (
    <div className="streak-card">

      <h2>🔥 Daily Streak</h2>

      <div className="streak-value">{streakDays} {streakDays === 1 ? "Day" : "Days"}</div>

      <p>Current Coding Streak</p>

      <div className="streak-row">
        <span>🏆 Problems solved</span>
        <strong>{problemsSolved} / {totalProblems}</strong>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <hr />

      <div className="streak-row">
        <span>⭐ Weekly goal</span>
        <strong>{goalStatus} · {weeklyGoal}/week</strong>
      </div>

      <div className="streak-row">
        <span>🎯 Next milestone</span>
        <strong>{nextMilestone} problems</strong>
      </div>

    </div>
  );
}

export default StreakCard;
