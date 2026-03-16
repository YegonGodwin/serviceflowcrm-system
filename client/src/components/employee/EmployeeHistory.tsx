import EmployeeSidebar from "./EmployeeSidebar";
import Topbar from "../admin/Topbar";
import { Search, Download, ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function EmployeeHistory() {
  const { logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [tasksResponse, feedbackResponse] = await Promise.all([
          api.get('/service-requests'),
          api.get('/feedback'),
        ]);
        setTasks(tasksResponse.data);
        setFeedbacks(feedbackResponse.data);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const ratingByRequest = useMemo(() => {
    const map = new Map<string, number[]>();
    feedbacks.forEach((feedback: any) => {
      const requestId = typeof feedback.serviceRequest === "string"
        ? feedback.serviceRequest
        : feedback.serviceRequest?._id;
      if (!requestId) return;
      if (!map.has(requestId)) {
        map.set(requestId, []);
      }
      map.get(requestId)?.push(Number(feedback.rating) || 0);
    });
    return map;
  }, [feedbacks]);

  const completedTasks = useMemo(() => {
    const list = tasks
      .filter((task: any) => task.status === 'completed' || task.completionDate)
      .sort((a: any, b: any) => {
        const dateA = new Date(a.completionDate || a.updatedAt || a.createdAt).getTime();
        const dateB = new Date(b.completionDate || b.updatedAt || b.createdAt).getTime();
        return dateB - dateA;
      });

    if (!search.trim()) {
      return list;
    }

    const query = search.trim().toLowerCase();
    return list.filter((task: any) => {
      const haystack = [
        task._id,
        task.client?.name,
        task.title,
        task.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [tasks, search]);

  return (
    <main className="dashboard-page">
      <EmployeeSidebar onLogout={logout} activeItem="Completed Jobs" />

      <section className="dashboard-main">
        <Topbar title="Job History" />

        <div className="dashboard-content">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search history..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <Download size={18} />
              <span>Export History</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="animate-spin text-blue-600" size={36} />
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50">
                  <tr className="text-gray-500 text-sm uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Job ID</th>
                    <th className="px-6 py-4 font-semibold">Client & Service</th>
                    <th className="px-6 py-4 font-semibold">Completion Date</th>
                    <th className="px-6 py-4 font-semibold">Client Rating</th>
                    <th className="px-6 py-4 font-semibold text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {completedTasks.map((job: any) => {
                    const requestId = job._id;
                    const ratings = ratingByRequest.get(requestId) || [];
                    const avgRating = ratings.length
                      ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length
                      : null;

                    return (
                      <tr key={job._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-500">#{job._id?.slice(-6)}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-800">{job.client?.name || "Private Client"}</p>
                            <p className="text-sm text-gray-500">{job.title}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(job.completionDate || job.updatedAt || job.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {avgRating ? (
                            <div className="flex items-center">
                              <span className="font-bold text-gray-800 mr-1.5">{avgRating.toFixed(1)}</span>
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} className={`w-4 h-4 fill-current ${i < Math.floor(avgRating) ? 'text-yellow-400' : 'text-gray-200'}`} viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No rating yet</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-lg hover:bg-blue-50">
                            <ExternalLink size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {completedTasks.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">No completed jobs yet.</td>
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
