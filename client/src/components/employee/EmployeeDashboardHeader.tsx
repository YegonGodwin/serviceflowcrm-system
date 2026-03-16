import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function EmployeeDashboardHeader() {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, "0");
  const dayName = time.toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div className="content-head">
      <h2 className="text-gray-900">Welcome back, {user?.name}</h2>
      <div className="content-time">
        <strong className="text-gray-900">{displayHours}:{displayMinutes}</strong>
        <span className="text-gray-900">{ampm}</span>
        <p className="text-gray-600">{dayName}</p>
      </div>
    </div>
  );
}
