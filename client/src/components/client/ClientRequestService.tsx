import { AlignJustify, Briefcase, Filter, MoreVertical, Plus, Search, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import Topbar from "../admin/Topbar";
import ClientSidebar from "./ClientSidebar";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function ClientRequestService() {
  const { logout } = useAuth();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // New Request Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/service-requests');
      setRequests(response.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/service-requests', { title, description, priority });
      setShowModal(false);
      setTitle("");
      setDescription("");
      setPriority("medium");
      fetchRequests();
    } catch (err) {
      console.error("Error creating request:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
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
    inProgress: requests.filter((r: any) => r.status === 'in-progress').length,
    pending: requests.filter((r: any) => r.status === 'pending').length,
    completed: requests.filter((r: any) => r.status === 'completed').length,
  };

  return (
    <main className="dashboard-page client-dashboard-page">
      <ClientSidebar onLogout={logout} activeItem="Request Service" />

      <section className="dashboard-main">
        <Topbar title="Request Service" />

        <div className="dashboard-content">
          <div className="client-request-header">
            <button 
              type="button" 
              className="client-btn-new-request"
              onClick={() => setShowModal(true)}
            >
              <Plus size={18} />
              New Request
            </button>

            <div className="client-request-actions">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input type="text" placeholder="Search requests" className="search-input" />
              </div>

              <button type="button" className="btn-filter">
                <Filter size={18} />
                Filter
              </button>

              <button type="button" className="btn-menu" aria-label="View options">
                <AlignJustify size={20} />
              </button>
            </div>
          </div>

          <div className="client-request-stats">
            <div className="client-request-stat-card">
              <div className="client-request-stat-icon">
                <Briefcase size={18} />
              </div>
              <div className="client-request-stat-info">
                <div className="client-request-stat-label">In Progress</div>
                <div className="client-request-stat-value">{stats.inProgress}</div>
              </div>
            </div>

            <div className="client-request-stat-card">
              <div className="client-request-stat-icon">
                <Briefcase size={18} />
              </div>
              <div className="client-request-stat-info">
                <div className="client-request-stat-label">Pending</div>
                <div className="client-request-stat-value">{stats.pending}</div>
              </div>
            </div>

            <div className="client-request-stat-card">
              <div className="client-request-stat-icon">
                <Briefcase size={18} />
              </div>
              <div className="client-request-stat-info">
                <div className="client-request-stat-label">Completed Requests</div>
                <div className="client-request-stat-value">{stats.completed}</div>
              </div>
            </div>
          </div>

          <div className="employees-table-container">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="animate-spin text-blue-600" size={40} />
              </div>
            ) : (
              <table className="employees-table client-request-table">
                <thead>
                  <tr>
                    <th>Request Id</th>
                    <th>Service Requested</th>
                    <th>Description</th>
                    <th>Requested On</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((entry: any) => (
                    <tr key={entry._id}>
                      <td className="font-mono text-xs">#{entry._id.slice(-6)}</td>
                      <td>{entry.title}</td>
                      <td className="max-w-xs truncate">{entry.description}</td>
                      <td>{new Date(entry.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(entry.status)}`}>
                          {entry.status}
                        </span>
                      </td>
                      <td>
                        <button type="button" className="btn-action">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">No service requests found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-[#222659] p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">New Service Request</h3>
              <button onClick={() => setShowModal(false)} className="hover:bg-white/10 p-1 rounded">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Service Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#222659] outline-none text-gray-900" 
                  placeholder="e.g. Office Computer Repair"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#222659] outline-none h-32 text-gray-900" 
                  placeholder="Provide details about your request..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#222659] outline-none text-gray-900"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="pt-4 flex space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-2 bg-[#F26323] text-white rounded-lg font-bold hover:bg-[#d9561d] disabled:opacity-70 flex items-center justify-center"
                >
                  {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
