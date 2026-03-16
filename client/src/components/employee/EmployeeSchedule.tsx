import EmployeeSidebar from "./EmployeeSidebar";
import Topbar from "../admin/Topbar";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function EmployeeSchedule() {
  const { logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get('/service-requests');
        setTasks(response.data);
      } catch (err) {
        console.error("Error fetching schedule data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isSameDay = (a: Date, b: Date) => (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );

  const scheduledTasks = useMemo(() => (
    tasks
      .filter((task: any) => Boolean(task.scheduledDate))
      .map((task: any) => ({
        ...task,
        scheduledAt: new Date(task.scheduledDate),
      }))
      .sort((a: any, b: any) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
  ), [tasks]);

  const todaysTasks = scheduledTasks.filter((task: any) => isSameDay(task.scheduledAt, today));

  const upcomingDays = Array.from({ length: 5 }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    const count = scheduledTasks.filter((task: any) => isSameDay(task.scheduledAt, date)).length;
    return { date, count };
  });

  const weekStart = new Date(today);
  const weekDay = (weekStart.getDay() + 6) % 7; // Monday-based
  weekStart.setDate(weekStart.getDate() - weekDay);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const weekScheduled = scheduledTasks.filter((task: any) => (
    task.scheduledAt >= weekStart && task.scheduledAt <= weekEnd
  ));
  const weekCompleted = tasks.filter((task: any) => (
    task.status === 'completed' &&
    task.completionDate &&
    new Date(task.completionDate) >= weekStart &&
    new Date(task.completionDate) <= weekEnd
  ));
  const weekInProgress = weekScheduled.filter((task: any) => task.status === 'in-progress');
  const completionRate = weekScheduled.length
    ? Math.round((weekCompleted.length / weekScheduled.length) * 100)
    : 0;

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      await api.put(`/service-requests/${taskId}`, { status: newStatus });
      const response = await api.get('/service-requests');
      setTasks(response.data);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    }
  };

  return (
    <main className="dashboard-page">
      <EmployeeSidebar onLogout={logout} activeItem="Schedule" />

      <section className="dashboard-main">
        <Topbar title="My Schedule" />

        <div className="dashboard-content">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {today.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button className="p-2 hover:bg-gray-100 transition-colors border-r border-gray-200">
                        <ChevronLeft size={20} />
                    </button>
                    <button className="p-2 hover:bg-gray-100 transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
                <button className="text-blue-600 font-semibold text-sm hover:underline ml-2">Today</button>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-1 flex">
                <button className="px-4 py-1.5 text-sm font-medium bg-blue-50 text-blue-600 rounded-md">Day</button>
                <button className="px-4 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700">Week</button>
                <button className="px-4 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700">Month</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                    <CalendarIcon className="mr-2 text-blue-600" size={20} />
                    Today, {today.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                </h3>
                {isLoading ? (
                  <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-100 flex justify-center">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                  </div>
                ) : (
                  <>
                    {todaysTasks.map((task: any) => (
                      <div key={task._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start space-x-6 hover:shadow-md transition-shadow">
                          <div className="text-center min-w-[96px]">
                              <p className="text-lg font-bold text-gray-800">
                                {task.scheduledAt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <p className="text-xs font-semibold text-gray-400 uppercase">Scheduled</p>
                          </div>
                          <div className="flex-1 border-l border-gray-100 pl-6">
                              <h4 className="font-bold text-gray-800 text-lg mb-1">{task.client?.name || "Private Client"}</h4>
                              <p className="text-blue-600 font-medium mb-3">{task.title}</p>
                              <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                                  <div className="flex items-center">
                                      <Clock size={16} className="mr-1.5" />
                                      {task.status?.replace('-', ' ')}
                                  </div>
                                  <div className="flex items-center">
                                      Priority: <span className="ml-1 font-semibold">{task.priority || 'medium'}</span>
                                  </div>
                              </div>
                          </div>
                          <div className="self-center">
                            {task.status === 'pending' || task.status === 'assigned' ? (
                              <button
                                onClick={() => handleStatusUpdate(task._id, 'in-progress')}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                              >
                                  Start Job
                              </button>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                {task.status}
                              </span>
                            )}
                          </div>
                      </div>
                    ))}
                    {todaysTasks.length === 0 && (
                      <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                        No scheduled jobs for today.
                      </div>
                    )}
                  </>
                )}
            </div>

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Availability</h3>
                    <div className="space-y-3">
                        {upcomingDays.map((day) => (
                            <div key={day.date.toISOString()} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                <span className="text-gray-600 font-medium">
                                  {day.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                                <span className={`text-sm font-semibold ${day.count === 0 ? 'text-green-600' : 'text-amber-600'}`}>
                                  {day.count === 0 ? 'Available' : `${day.count} job${day.count > 1 ? 's' : ''}`}
                                </span>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-2 border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                        Request Time Off
                    </button>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-xl shadow-lg text-white">
                    <h3 className="text-lg font-bold mb-2">Weekly Summary</h3>
                    <p className="text-blue-100 text-sm mb-6">
                      {weekScheduled.length ? `You completed ${completionRate}% of scheduled jobs this week.` : 'No scheduled jobs this week yet.'}
                    </p>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Tasks Done</span>
                                <span className="font-bold">{weekCompleted.length}/{weekScheduled.length || 0}</span>
                            </div>
                            <div className="w-full bg-blue-400 bg-opacity-30 h-2 rounded-full overflow-hidden">
                                <div className="bg-white h-full" style={{ width: `${completionRate}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>In Progress</span>
                                <span className="font-bold">{weekInProgress.length}</span>
                            </div>
                            <div className="w-full bg-blue-400 bg-opacity-30 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-white h-full"
                                  style={{ width: `${weekScheduled.length ? Math.round((weekInProgress.length / weekScheduled.length) * 100) : 0}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
