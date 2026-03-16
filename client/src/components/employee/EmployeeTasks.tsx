import EmployeeSidebar from "./EmployeeSidebar";
import Topbar from "../admin/Topbar";
import { Search, Filter, Loader2, Play, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function EmployeeTasks() {
  const { logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/service-requests');
      setTasks(response.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      await api.put(`/service-requests/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high": return "text-red-600";
      case "medium": return "text-orange-600";
      case "low": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  return (
    <main className="dashboard-page">
      <EmployeeSidebar onLogout={logout} activeItem="My Tasks" />

      <section className="dashboard-main">
        <Topbar title="My Assigned Tasks" />

        <div className="dashboard-content">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search tasks..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                <Filter size={18} />
                <span>Filter</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="animate-spin text-blue-600" size={40} />
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50">
                  <tr className="text-gray-500 text-sm uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Client & Service</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Priority</th>
                    <th className="px-6 py-4 font-semibold">Scheduled Date</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tasks.map((task: any) => (
                    <tr key={task._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-800">{task.client?.name || "Private Client"}</p>
                          <p className="text-sm text-gray-500">{task.title}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          task.status === "in-progress" ? "bg-blue-100 text-blue-700" : 
                          task.status === "completed" ? "bg-green-100 text-green-700" : 
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${getPriorityClass(task.priority)}`}>
                          ● {task.priority || "Medium"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {task.scheduledDate ? new Date(task.scheduledDate).toLocaleDateString() : 'TBD'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          {task.status === 'pending' && (
                            <button 
                              onClick={() => handleStatusUpdate(task._id, 'in-progress')}
                              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                            >
                              <Play size={14} /> Start
                            </button>
                          )}
                          {task.status === 'in-progress' && (
                            <button 
                              onClick={() => handleStatusUpdate(task._id, 'completed')}
                              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                            >
                              <CheckCircle size={14} /> Complete
                            </button>
                          )}
                          {task.status === 'completed' && (
                            <span className="text-xs text-gray-400 font-medium">Done</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tasks.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">No tasks assigned yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
