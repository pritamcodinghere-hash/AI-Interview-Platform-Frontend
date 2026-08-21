import { useEffect, useState } from "react";

function Timer({ initialSeconds = 0, onTick }) {
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => {
        const next = s + 1;
        if (onTick) onTick(next);
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [onTick]);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return <span>{String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}</span>;
}

export default Timer;
