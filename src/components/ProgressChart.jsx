import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const FALLBACK = [
  { day: "Mon", score: 0 },
  { day: "Tue", score: 0 },
  { day: "Wed", score: 0 },
  { day: "Thu", score: 0 },
  { day: "Fri", score: 0 },
  { day: "Sat", score: 0 },
  { day: "Sun", score: 0 },
];

function ProgressChart({ data }) {
  const chartData = data && data.length ? data : FALLBACK;

  return (
    <div className="chart-card">
      <h2>📈 Weekly Progress</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="4 6" vertical={false} />

          <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} axisLine={false} />

          <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} width={34} allowDecimals={false} />

          <Tooltip
            contentStyle={{
              background: "#0c1428",
              border: "1px solid rgba(148,163,184,0.25)",
              borderRadius: 10,
              color: "#e8edf7",
              fontFamily: "Poppins, sans-serif",
              fontSize: 13,
            }}
            labelStyle={{ color: "#93c5fd" }}
          />

          <Line
            type="monotone"
            dataKey="score"
            stroke="#3b82f6"
            strokeWidth={4}
            dot={{ r: 4, fill: "#0c1428", stroke: "#8b5cf6", strokeWidth: 2 }}
            activeDot={{ r: 7, stroke: "#22d3ee", strokeWidth: 3, fill: "#0c1428" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ProgressChart;
