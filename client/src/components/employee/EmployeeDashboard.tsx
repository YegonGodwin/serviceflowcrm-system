import EmployeeSidebar from "./EmployeeSidebar";
import Topbar from "../admin/Topbar";
import EmployeeDashboardHeader from "./EmployeeDashboardHeader";
import { Briefcase, CheckCircle, Clock, Calendar, Loader2, ChevronRight, Wallet, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function EmployeeDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [earningStats, setEarningStats] = useState({ totalEarned: 0, available: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, earningsRes] = await Promise.all([
          api.get('/service-requests'),
          api.get('/earnings')
        ]);
        setTasks(tasksRes.data);
        setEarnings(earningsRes.data.earnings || []);
        setEarningStats(earningsRes.data.stats || { totalEarned: 0, available: 0 });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { 
      label: "Total Earned", 
      value: `Ksh ${earningStats.totalEarned.toLocaleString()}`, 
      icon: TrendingUp, 
      color: "text-green-600", 
      bg: "bg-green-100",
      path: "/employee/tasks"
    },
    { 
      label: "Available for Payout", 
      value: `Ksh ${earningStats.available.toLocaleString()}`, 
      icon: Wallet, 
      color: "text-blue-600", 
      bg: "bg-blue-100",
      path: "/employee/tasks"
    },
    { 
      label: "Completed Tasks", 
      value: tasks.filter((t: any) => t.status === 'completed').length.toString(), 
      icon: CheckCircle, 
      color: "text-green-600", 
      bg: "bg-green-100",
      path: "/employee/tasks"
    },
    { 
      label: "Assigned Tasks", 
      value: tasks.length.toString(), 
      icon: Briefcase, 
      color: "text-purple-600", 
      bg: "bg-purple-100",
      path: "/employee/tasks"
    },
  ];

  const recentTasks = tasks.slice(0, 5);
  const recentEarnings = earnings.slice(0, 5);

  return (
    <main className="dashboard-page">
      <EmployeeSidebar onLogout={logout} activeItem="Dashboard" />

      <section className="dashboard-main">
        <Topbar title="Employee Dashboard" />

        <div className="dashboard-content">
          <EmployeeDashboardHeader />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-6">
            {stats.map((stat, idx) => (
              <div 
                key={idx} 
                onClick={() => navigate(stat.path)}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 cursor-pointer hover:shadow-md hover:border-[#F26323]/30 transition-all group"
              >
                <div className={`${stat.bg} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                  <stat.icon className={stat.color} size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="content-grid gap-6">
            {/* Recent Tasks Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Recently Assigned Tasks</h3>
                <button 
                  onClick={() => navigate('/employee/tasks')}
                  className="text-blue-600 text-sm font-medium hover:underline flex items-center"
                >
                  View All <ChevronRight size={16} />
                </button>
              </div>
              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="animate-spin text-gray-400" />
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-gray-400 text-sm uppercase tracking-wider border-b border-gray-100">
                        <th className="pb-3 font-medium">Client</th>
                        <th className="pb-3 font-medium">Service</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Requested On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {recentTasks.map((task: any) => (
                        <tr 
                          key={task._id} 
                          onClick={() => navigate('/employee/tasks')}
                          className="hover:bg-gray-50 transition-colors cursor-pointer group"
                        >
                          <td className="py-4 font-medium group-hover:text-[#F26323] transition-colors">{task.client?.name || "Private Client"}</td>
                          <td className="py-4">{task.title}</td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              task.status === "in-progress" ? "bg-blue-100 text-blue-700" : 
                              task.status === "completed" ? "bg-green-100 text-green-700" :
                              "bg-yellow-100 text-yellow-700"
                            }`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="py-4 text-sm text-gray-500">{new Date(task.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      {recentTasks.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-gray-500">No tasks assigned yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Recent Payouts Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Recent Payouts</h3>
                <div className="space-y-4">
                    {isLoading ? (
                      <div className="flex justify-center p-4">
                        <Loader2 className="animate-spin text-gray-400" size={20} />
                      </div>
                    ) : (
                      <>
                        {recentEarnings.map((earning: any) => (
                          <div key={earning._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="overflow-hidden">
                              <p className="text-sm font-bold text-gray-800 truncate">{earning.serviceRequest?.title || "Service Payout"}</p>
                              <p className="text-[10px] text-gray-500">{new Date(earning.createdAt).toLocaleDateString()} • {earning.invoice?.invoiceNumber}</p>
                            </div>
                            <div className="text-right ml-2">
                              <p className="text-sm font-bold text-green-600">+Ksh {earning.commissionAmount.toLocaleString()}</p>
                              <p className="text-[9px] uppercase font-bold text-blue-500">{earning.status}</p>
                            </div>
                          </div>
                        ))}
                        {recentEarnings.length === 0 && (
                          <p className="text-center py-8 text-gray-500 text-sm">No payouts recorded yet.</p>
                        )}
                        {recentEarnings.length > 0 && (
                           <button 
                             onClick={() => navigate('/employee/earnings')}
                             className="w-full py-2 text-xs font-bold text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                             View Payout History
                           </button>
                        )}
                      </>
                    )}
                </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
