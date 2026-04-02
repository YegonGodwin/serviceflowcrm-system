import { CircleUserRound, Mail, MapPinHouse, Phone, Loader2 } from "lucide-react";
import Topbar from "../admin/Topbar";
import ClientSidebar from "./ClientSidebar";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import api from "../../services/api";

export default function ClientProfile() {
  const { user, logout, login } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  
  // Local Form State
  const [name, setName] = useState(user?.name || "");
  const email = user?.email || "";
  const [phone, setPhone] = useState(user?.phone || "");
  const [companyName, setCompanyName] = useState(user?.companyName || "");
  const [address, setAddress] = useState(user?.address || "");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Assuming we have a profile update endpoint
      const response = await api.put('/auth/profile', {
        name,
        email,
        phone,
        companyName,
        address
      });
      // Update local context if backend returns updated user
      if (response.data) {
        // Keep the token from existing user
        login({ ...response.data, token: user?.token });
        alert("Profile updated successfully!");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="dashboard-page client-dashboard-page">
      <ClientSidebar onLogout={logout} activeItem="Profile" />

      <section className="dashboard-main text-gray-900">
        <Topbar title="Profile" />

        <div className="dashboard-content">
          <div className="client-profile-page-grid">
            <section className="client-account-card">
              <div className="client-account-head">
                <div className="client-account-avatar text-gray-400">
                  <CircleUserRound size={64} />
                </div>
                <div className="client-account-copy">
                  <h2 className="text-gray-900">{user?.name}</h2>
                  <p className="text-gray-500 font-mono text-xs">ID: #{user?._id.slice(-6)}</p>
                </div>
              </div>

              <div className="client-account-meta mt-6 space-y-3">
                <div className="client-account-meta-item flex items-center space-x-3 text-gray-700">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                <div className="client-account-meta-item flex items-center space-x-3 text-gray-700">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-sm">{user?.phone || "No phone added"}</span>
                </div>
                <div className="client-account-meta-item flex items-center space-x-3 text-gray-700">
                  <MapPinHouse size={16} className="text-gray-400" />
                  <span className="text-sm">{user?.address || "No address added"}</span>
                </div>
              </div>
            </section>

            <section className="client-profile-form-card bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Personal Information</h3>

              <form onSubmit={handleSave} className="client-profile-form space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="client-form-row flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1" htmlFor="name">Full Name</label>
                    <input 
                      id="name" 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border rounded-lg p-2 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[#222659] transition-all"
                    />
                  </div>

                  <div className="client-form-row flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1" htmlFor="email">Email Address</label>
                    <input 
                      id="email" 
                      type="email" 
                      value={email}
                      disabled
                      className="border rounded-lg p-2 bg-gray-100 cursor-not-allowed outline-none text-gray-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="client-form-row flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1" htmlFor="phone">Phone Number</label>
                    <input 
                      id="phone" 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="border rounded-lg p-2 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[#222659] transition-all"
                    />
                  </div>

                  <div className="client-form-row flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1" htmlFor="company">Company</label>
                    <input 
                      id="company" 
                      type="text" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="border rounded-lg p-2 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[#222659] transition-all"
                    />
                  </div>
                </div>

                <div className="client-form-row flex flex-col">
                  <label className="text-sm font-semibold text-gray-600 mb-1" htmlFor="address">Address / Location</label>
                  <input 
                    id="address" 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Nairobi, Kenya"
                    className="border rounded-lg p-2 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[#222659] transition-all"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="client-profile-save bg-[#F26323] text-white py-3 px-8 rounded-lg font-bold hover:bg-[#d9561d] transition-all flex items-center justify-center mt-4 disabled:opacity-70"
                >
                  {isSaving ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                  Save Changes
                </button>
              </form>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
