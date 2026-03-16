import { Plus, Search, Filter, MoreVertical, User as UserIcon, Loader2, X } from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function Clients() {
  const { logout } = useAuth();
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Client Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/auth/users?role=client');
      setClients(response.data);
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/auth/register', { 
        name, 
        email, 
        password, 
        role: 'client',
        phone,
        companyName
      });
      setShowModal(false);
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setCompanyName("");
      fetchClients();
    } catch (err) {
      console.error("Error creating client:", err);
      alert("Failed to create client. Email might already be in use.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "status-active" : "status-inactive";
  };

  return (
    <main className="dashboard-page">
      <Sidebar onLogout={logout} activeItem="Clients" />

      <section className="dashboard-main text-gray-900">
        <Topbar title="Clients" />

        <div className="dashboard-content">
          <div className="employees-header">
            <button 
              type="button" 
              className="btn-add-employee"
              onClick={() => setShowModal(true)}
            >
              <Plus size={18} />
              Add Client
            </button>

            <div className="employees-actions">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search clients"
                  className="search-input"
                />
              </div>

              <button type="button" className="btn-filter">
                <Filter size={18} />
                Filter
              </button>

              <button type="button" className="btn-menu">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          <div className="employees-table-container">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="animate-spin text-blue-600" size={40} />
              </div>
            ) : (
              <table className="employees-table clients-table">
                <thead>
                  <tr>
                    <th>Client ID</th>
                    <th>Name & Company</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client: any) => (
                    <tr key={client._id}>
                      <td className="font-mono text-xs">#{client._id.slice(-6)}</td>
                      <td>
                        <div className="client-name-cell flex items-center space-x-3">
                          <div className="client-avatar bg-gray-100 p-2 rounded-lg text-gray-500">
                            <UserIcon size={16} />
                          </div>
                          <div className="client-info">
                            <div className="client-name font-bold text-gray-900">{client.name}</div>
                            {client.companyName && (
                              <div className="client-company text-xs text-gray-500">{client.companyName}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-sm text-gray-600">{client.email}</td>
                      <td className="text-sm text-gray-600">{client.phone || "N/A"}</td>
                      <td>
                        <span className={`status-badge ${getStatusColor(client.isActive)}`}>
                          {client.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button type="button" className="btn-action">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {clients.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500 font-medium">No clients registered yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      {/* Add Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-[#222659] p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">Register New Client</h3>
              <button onClick={() => setShowModal(false)} className="hover:bg-white/10 p-1 rounded">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Person Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#222659] outline-none text-gray-900" 
                  placeholder="e.g. Francis Ngigi"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name</label>
                <input 
                  type="text" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#222659] outline-none text-gray-900" 
                  placeholder="e.g. Techno Solutions"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#222659] outline-none text-gray-900" 
                  placeholder="client@company.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Temporary Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#222659] outline-none text-gray-900" 
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#222659] outline-none text-gray-900" 
                  placeholder="+254..."
                />
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
                  Register Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
