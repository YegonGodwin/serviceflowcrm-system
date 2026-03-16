import { Plus, Search, Filter, MoreVertical, Loader2, X } from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function Employees() {
  const { logout } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Employee Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/auth/users?role=employee');
      setEmployees(response.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/auth/register', { 
        name, 
        email, 
        password, 
        role: 'employee',
        phone,
        department
      });
      setShowModal(false);
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setDepartment("");
      fetchEmployees();
    } catch (err) {
      console.error("Error creating employee:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "status-active";
      case "inactive":
        return "status-inactive";
      case "suspended":
        return "status-suspended";
      default:
        return "status-active"; // Defaulting to active for new users
    }
  };

  return (
    <main className="dashboard-page font-poppins">
      <Sidebar onLogout={logout} activeItem="Employees" />

      <section className="dashboard-main">
        <Topbar title="Employees" />

        <div className="dashboard-content font-poppins">
          <div className="employees-header">
            <button 
              type="button" 
              className="btn-add-employee"
              onClick={() => setShowModal(true)}
            >
              <Plus size={18} />
              Add Employee
            </button>

            <div className="employees-actions">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search employees"
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

          <div className="employees-table-container font-poppins">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="animate-spin text-blue-600" size={40} />
              </div>
            ) : (
              <table className="employees-table font-poppins text-gray-900">
                <thead>
                  <tr>
                    <th>Emp ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee: any) => (
                    <tr key={employee._id}>
                      <td className="font-mono text-xs">#{employee._id.slice(-6)}</td>
                      <td>{employee.name}</td>
                      <td>{employee.email}</td>
                      <td>{employee.phone || "N/A"}</td>
                      <td>{employee.department || "N/A"}</td>
                      <td>
                        <span className={`status-badge ${getStatusColor(employee.isActive ? 'active' : 'inactive')}`}>
                          {employee.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button type="button" className="btn-action">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">No employees found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-[#222659] p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">Register New Employee</h3>
              <button onClick={() => setShowModal(false)} className="hover:bg-white/10 p-1 rounded">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#222659] outline-none text-gray-900" 
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#222659] outline-none text-gray-900" 
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#222659] outline-none text-gray-900" 
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                  <input 
                    type="text" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#222659] outline-none text-gray-900" 
                    placeholder="07..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Department</label>
                  <select 
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#222659] outline-none text-gray-900"
                  >
                    <option value="">Select Dept</option>
                    <option value="Computer Repair">Computer Repair</option>
                    <option value="Software">Software</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>
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
                  className="flex-1 py-2 bg-[#222659] text-white rounded-lg font-bold hover:bg-[#1a1e46] disabled:opacity-70 flex items-center justify-center"
                >
                  {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
