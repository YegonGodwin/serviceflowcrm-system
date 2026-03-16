import { AlignJustify, Briefcase, Filter, MoreVertical, Search, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Topbar from "../admin/Topbar";
import ClientSidebar from "./ClientSidebar";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function ClientServiceProgress() {
  const { logout } = useAuth();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/service-requests');
      setRequests(response.data);
    } catch (err) {
      console.error("Error fetching service requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

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

  const filteredRequests = requests.filter((req: any) => 
    req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    inProgress: requests.filter((r: any) => r.status === 'in-progress').length,
    pending: requests.filter((r: any) => r.status === 'pending').length,
    completed: requests.filter((r: any) => r.status === 'completed').length,
  };

  return (
    <main className="dashboard-page client-dashboard-page">
      <ClientSidebar onLogout={logout} activeItem="Service Progress" />

      <section className="dashboard-main">
        <Topbar title="Service Progress" />

        <div className="dashboard-content">
          <div className="client-request-header client-progress-header">
            <div className="client-request-actions client-progress-actions">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search by ID or service name" 
                  className="search-input" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
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
              <div className="client-request-stat-icon text-blue-600">
                <Briefcase size={18} />
              </div>
              <div className="client-request-stat-info">
                <div className="client-request-stat-label">In Progress</div>
                <div className="client-request-stat-value">{stats.inProgress}</div>
              </div>
            </div>

            <div className="client-request-stat-card">
              <div className="client-request-stat-icon text-yellow-600">
                <Briefcase size={18} />
              </div>
              <div className="client-request-stat-info">
                <div className="client-request-stat-label">Pending</div>
                <div className="client-request-stat-value">{stats.pending}</div>
              </div>
            </div>

            <div className="client-request-stat-card">
              <div className="client-request-stat-icon text-green-600">
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
                  {filteredRequests.map((entry: any) => (
                    <tr key={entry._id}>
                      <td className="font-mono text-xs">#{entry._id.slice(-6)}</td>
                      <td>{entry.title}</td>
                      <td className="max-w-xs truncate text-gray-600 text-sm">{entry.description}</td>
                      <td className="text-gray-500 text-xs">{new Date(entry.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${getStatusColor(entry.status)}`}>
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
                  {filteredRequests.length === 0 && (
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
    </main>
  );
}
