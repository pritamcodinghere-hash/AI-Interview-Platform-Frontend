import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { day: "Mon", score: 20 },
  { day: "Tue", score: 35 },
  { day: "Wed", score: 45 },
  { day: "Thu", score: 60 },
  { day: "Fri", score: 72 },
  { day: "Sat", score: 88 },
  { day: "Sun", score: 95 },
];

function ProgressChart() {
  return (
    <div className="chart-card">
      <h2>📈 Weekly Progress</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid stroke="#334155" />

          <XAxis dataKey="day" stroke="#cbd5e1" />

          <YAxis stroke="#cbd5e1" />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="score"
            stroke="#3b82f6"
            strokeWidth={4}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ProgressChart;