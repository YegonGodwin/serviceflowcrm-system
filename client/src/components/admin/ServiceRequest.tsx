import { Search, Filter, MoreVertical, Briefcase, Loader2, UserPlus, CheckCircle, Clock } from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function ServiceRequest() {
  const { logout } = useAuth();
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [assignmentData, setAssignmentData] = useState({
    assignedTo: "",
    cost: 0,
    scheduledDate: ""
  });

  const fetchRequests = async () => {
    try {
      const response = await api.get('/service-requests');
      setRequests(response.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get('/auth/users?role=employee');
        setEmployees(response.data);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };
    fetchRequests();
    fetchEmployees();
  }, []);

  const handleAssignClick = (request: any) => {
    setSelectedRequest(request);
    setAssignmentData({
      assignedTo: request.assignedTo?._id || "",
      cost: request.cost || 0,
      scheduledDate: request.scheduledDate ? new Date(request.scheduledDate).toISOString().split('T')[0] : ""
    });
    setIsAssigning(true);
  };

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/service-requests/${selectedRequest._id}`, {
        ...assignmentData,
        status: "in-progress"
      });
      setIsAssigning(false);
      fetchRequests(); // Refresh list
    } catch (err) {
      console.error("Error assigning request:", err);
      alert("Failed to assign request. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "status-active";
      case "in-progress":
        return "status-inprogress";
      case "pending":
        return "status-suspended";
      default:
        return "status-suspended";
    }
  };

  const stats = {
    total: requests.length,
    inProgress: requests.filter((r: any) => r.status === 'in-progress').length,
    completed: requests.filter((r: any) => r.status === 'completed').length,
    pending: requests.filter((r: any) => r.status === 'pending').length,
  };

  return (
    <main className="dashboard-page">
      <Sidebar onLogout={logout} activeItem="Service Request" />

      <section className="dashboard-main">
        <Topbar title="Service Request" />

        <div className="dashboard-content">
          <div className="service-request-header">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search requests"
                className="search-input"
              />
            </div>

            <div className="service-request-actions">
              <button type="button" className="btn-filter">
                <Filter size={18} />
                Filter
              </button>
            </div>
          </div>

          <div className="service-stats">
            <div className="stat-card">
              <div className="stat-icon"><Briefcase size={24} /></div>
              <div className="stat-info">
                <div className="stat-label">Total Requests</div>
                <div className="stat-value">{stats.total}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon text-blue-600"><Clock size={24} /></div>
              <div className="stat-info">
                <div className="stat-label">InProgress</div>
                <div className="stat-value">{stats.inProgress}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon text-green-600"><CheckCircle size={24} /></div>
              <div className="stat-info">
                <div className="stat-label">Completed</div>
                <div className="stat-value">{stats.completed}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon text-yellow-600"><Clock size={24} /></div>
              <div className="stat-info">
                <div className="stat-label">Pending</div>
                <div className="stat-value">{stats.pending}</div>
              </div>
            </div>
          </div>

          <div className="employees-table-container">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="animate-spin text-blue-600" size={40} />
              </div>
            ) : (
              <table className="employees-table service-request-table">
                <thead>
                  <tr>
                    <th>Request Id</th>
                    <th>Description</th>
                    <th>Requester</th>
                    <th>Assigned To</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request: any) => (
                    <tr key={request._id}>
                      <td className="font-mono text-xs">#{request._id.slice(-6)}</td>
                      <td>
                        <div className="font-medium text-gray-900">{request.title}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{request.description}</div>
                      </td>
                      <td>
                        <div className="requester-name text-gray-900">{request.client?.name}</div>
                        <div className="text-xs text-gray-500">{new Date(request.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td>
                        {request.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] text-blue-600 font-bold">
                              {request.assignedTo.name.charAt(0)}
                            </div>
                            <span className="text-sm">{request.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Not Assigned</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleAssignClick(request)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                        >
                          <UserPlus size={16} />
                          Assign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Assignment Modal */}
        {isAssigning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Assign Service Request</h3>
                <button onClick={() => setIsAssigning(false)} className="text-gray-400 hover:text-gray-600">×</button>
              </div>
              <form onSubmit={handleAssignmentSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
                  <select 
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={assignmentData.assignedTo}
                    onChange={(e) => setAssignmentData({...assignmentData, assignedTo: e.target.value})}
                  >
                    <option value="">Choose an employee...</option>
                    {employees.map((emp: any) => (
                      <option key={emp._id} value={emp._id}>{emp.name} - {emp.position || 'Staff'}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Cost (Ksh)</label>
                  <input 
                    type="number"
                    required
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={assignmentData.cost}
                    onChange={(e) => setAssignmentData({...assignmentData, cost: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                  <input 
                    type="date"
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={assignmentData.scheduledDate}
                    onChange={(e) => setAssignmentData({...assignmentData, scheduledDate: e.target.value})}
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsAssigning(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    Save Assignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
