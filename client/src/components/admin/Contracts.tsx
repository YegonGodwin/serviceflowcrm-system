import { FileSignature, Filter, Search, Loader2, Plus, X, User, Calendar, DollarSign, FileText, CheckCircle, Eye } from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function Contracts() {
  const { logout } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewContract, setViewContract] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    client: "",
    title: "",
    amount: 0,
    startDate: "",
    endDate: "",
    terms: "",
    paymentFrequency: "monthly",
  });

  const fetchContracts = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/contracts');
      setContracts(response.data);
    } catch (err) {
      console.error("Error fetching contracts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/auth/users?role=client');
      setClients(response.data);
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  };

  useEffect(() => {
    fetchContracts();
    fetchClients();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/contracts', formData);
      setShowModal(false);
      setFormData({
        client: "",
        title: "",
        amount: 0,
        startDate: "",
        endDate: "",
        terms: "",
        paymentFrequency: "monthly",
      });
      fetchContracts();
      alert("Contract created and sent to client successfully!");
    } catch (err) {
      console.error("Error creating contract:", err);
      alert("Failed to create contract. Please check all fields.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "status-active";
      case "pending":
        return "status-suspended !bg-yellow-100 !text-yellow-700";
      case "expired":
        return "status-inactive";
      case "cancelled":
        return "status-inactive";
      default:
        return "status-suspended";
    }
  };

  const stats = {
    total: contracts.length,
    active: contracts.filter((c: any) => c.status === 'active').length,
    pending: contracts.filter((c: any) => c.status === 'pending').length,
    expired: contracts.filter((c: any) => c.status === 'expired').length,
  };

  return (
    <main className="dashboard-page">
      <Sidebar onLogout={logout} activeItem="Contracts" />

      <section className="dashboard-main text-gray-900">
        <Topbar title="Contracts" />

        <div className="dashboard-content">
          <div className="contracts-header flex justify-between items-center mb-6">
            <div className="flex gap-4">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input type="text" placeholder="Search contracts" className="search-input" />
              </div>
              <button type="button" className="btn-filter">
                <Filter size={18} />
                Filter
              </button>
            </div>

            <button 
              onClick={() => setShowModal(true)}
              className="bg-[#F26323] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#d9561d] transition-all shadow-md"
            >
              <Plus size={18} />
              Create Contract
            </button>
          </div>

          <div className="contracts-stats grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="contracts-stat-card bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="contracts-stat-icon bg-blue-50 p-2 rounded-lg w-fit text-blue-600 mb-2">
                <FileSignature size={20} />
              </div>
              <div className="contracts-stat-info">
                <div className="contracts-stat-label text-xs text-gray-500 font-medium">Total Contracts</div>
                <div className="contracts-stat-value text-xl font-bold">{stats.total}</div>
              </div>
            </div>

            <div className="contracts-stat-card bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="contracts-stat-icon bg-green-50 p-2 rounded-lg w-fit text-green-600 mb-2">
                <FileSignature size={20} />
              </div>
              <div className="contracts-stat-info">
                <div className="contracts-stat-label text-xs text-gray-500 font-medium">Active</div>
                <div className="contracts-stat-value text-xl font-bold">{stats.active}</div>
              </div>
            </div>

            <div className="contracts-stat-card bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="contracts-stat-icon bg-yellow-50 p-2 rounded-lg w-fit text-yellow-600 mb-2">
                <FileSignature size={20} />
              </div>
              <div className="contracts-stat-info">
                <div className="contracts-stat-label text-xs text-gray-500 font-medium">Pending</div>
                <div className="contracts-stat-value text-xl font-bold">{stats.pending}</div>
              </div>
            </div>

            <div className="contracts-stat-card bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="contracts-stat-icon bg-red-50 p-2 rounded-lg w-fit text-red-600 mb-2">
                <FileSignature size={20} />
              </div>
              <div className="contracts-stat-info">
                <div className="contracts-stat-label text-xs text-gray-500 font-medium">Expired</div>
                <div className="contracts-stat-value text-xl font-bold">{stats.expired}</div>
              </div>
            </div>
          </div>

          <div className="employees-table-container">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="animate-spin text-blue-600" size={40} />
              </div>
            ) : (
              <table className="employees-table contracts-table">
                <thead>
                  <tr>
                    <th>Contract Id</th>
                    <th>Description</th>
                    <th>Client Name</th>
                    <th>Date Range</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((contract: any) => (
                    <tr key={contract._id}>
                      <td className="font-mono text-xs">#{contract._id.slice(-6)}</td>
                      <td>
                        <div className="font-medium">{contract.title}</div>
                        <div className="text-[10px] text-gray-500 font-bold">Ksh {contract.amount.toLocaleString()} / {contract.paymentFrequency}</div>
                      </td>
                      <td>
                        <div className="requester-info">
                          <div className="requester-name font-medium">{contract.client?.name}</div>
                          {contract.client?.companyName && (
                            <div className="requester-company text-gray-500 text-[10px] uppercase font-bold tracking-tighter">{contract.client.companyName}</div>
                          )}
                        </div>
                      </td>
                      <td className="text-gray-600 text-xs">
                        <div className="font-bold">S: {new Date(contract.startDate).toLocaleDateString()}</div>
                        <div className="text-gray-400">E: {new Date(contract.endDate).toLocaleDateString()}</div>
                        {contract.signedAt && (
                          <div className="text-green-600 font-bold mt-1 uppercase tracking-tighter">Signed: {new Date(contract.signedAt).toLocaleDateString()}</div>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusColor(contract.status)}`}>
                          {contract.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-action"
                          onClick={() => setViewContract(contract)}
                          title="View contract details"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {contracts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">No contracts found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      {/* New Contract Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
            <div className="bg-[#222659] p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Initiate New Contract</h3>
                <p className="text-xs opacity-70">Define terms and send to client for approval.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="hover:bg-white/10 p-1 rounded">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Selection */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <User size={12} /> Select Client
                  </label>
                  <select
                    name="client"
                    required
                    value={formData.client}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#222659] outline-none text-gray-900 bg-gray-50"
                  >
                    <option value="">Choose a client...</option>
                    {clients.map((client: any) => (
                      <option key={client._id} value={client._id}>
                        {client.name} {client.companyName ? `(${client.companyName})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Contract Title */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <FileText size={12} /> Contract Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Annual Maintenance Service"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#222659] outline-none text-gray-900 bg-gray-50"
                  />
                </div>

                {/* Amount */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <DollarSign size={12} /> Contract Value (Ksh)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    required
                    min="0"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#222659] outline-none text-gray-900 bg-gray-50"
                  />
                </div>

                {/* Payment Frequency */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <FileSignature size={12} /> Billing Frequency
                  </label>
                  <select
                    name="paymentFrequency"
                    value={formData.paymentFrequency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#222659] outline-none text-gray-900 bg-gray-50"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                    <option value="one-time">One-time</option>
                  </select>
                </div>

                {/* Start Date */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={12} /> Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#222659] outline-none text-gray-900 bg-gray-50"
                  />
                </div>

                {/* End Date */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={12} /> End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    required
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#222659] outline-none text-gray-900 bg-gray-50"
                  />
                </div>
              </div>

              {/* Terms */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  Legal Terms & Conditions
                </label>
                <textarea
                  name="terms"
                  required
                  rows={6}
                  placeholder="Enter the detailed contract terms here..."
                  value={formData.terms}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#222659] outline-none text-gray-900 bg-gray-50 leading-relaxed"
                />
              </div>

              <div className="pt-6 border-t flex space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 text-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-[2] py-3 bg-[#F26323] text-white rounded-lg font-bold hover:bg-[#d9561d] disabled:opacity-70 flex items-center justify-center shadow-lg shadow-orange-200 transition-all"
                >
                  {isSubmitting ? <Loader2 className="animate-spin mr-2" size={20} /> : <FileSignature size={20} className="mr-2" />}
                  Create and Send Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Contract Detail View Modal (Admin) */}
      {viewContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="bg-[#222659] p-6 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-bold">{viewContract.title}</h3>
                <p className="text-xs opacity-70 font-mono">ID: {viewContract._id}</p>
              </div>
              <button onClick={() => setViewContract(null)} className="hover:bg-white/10 p-1 rounded">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-sm">
                <div><span className="text-gray-500 font-semibold">Client:</span> {viewContract.client?.name}</div>
                <div><span className="text-gray-500 font-semibold">Amount:</span> Ksh {viewContract.amount?.toLocaleString()}</div>
                <div><span className="text-gray-500 font-semibold">Frequency:</span> <span className="capitalize">{viewContract.paymentFrequency}</span></div>
                <div>
                  <span className="text-gray-500 font-semibold">Status:</span>{" "}
                  <span className={`status-badge ${viewContract.status === 'active' ? 'status-active' : viewContract.status === 'pending' ? 'status-suspended !bg-yellow-100 !text-yellow-700' : 'status-inactive'}`}>
                    {viewContract.status}
                  </span>
                </div>
                <div><span className="text-gray-500 font-semibold">Start:</span> {new Date(viewContract.startDate).toLocaleDateString()}</div>
                <div><span className="text-gray-500 font-semibold">End:</span> {new Date(viewContract.endDate).toLocaleDateString()}</div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 border-b pb-2">Terms & Conditions</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {viewContract.terms || "No terms specified."}
                </p>
              </div>

              {viewContract.signedAt && (
                <div className="flex items-center gap-2 text-green-600 font-bold text-sm bg-green-50 p-3 rounded-lg border border-green-100">
                  <CheckCircle size={18} />
                  Digitally signed on {new Date(viewContract.signedAt).toLocaleString()}
                </div>
              )}

              {viewContract.signature ? (
                <div className="border rounded-xl p-4 bg-gray-50">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Client Digital Signature</p>
                  <img
                    src={viewContract.signature}
                    alt="Client digital signature"
                    className="max-h-24 border border-gray-200 rounded-lg bg-white p-2"
                  />
                </div>
              ) : (
                viewContract.status === 'pending' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-700">
                    Awaiting client signature.
                  </div>
                )
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 shrink-0">
              <button
                type="button"
                onClick={() => setViewContract(null)}
                className="w-full py-3 border border-gray-300 rounded-lg font-semibold hover:bg-white text-gray-700 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
