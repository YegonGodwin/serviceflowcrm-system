import {
    Bell,
    Building2,
    CircleUserRound,
    Globe,
    KeyRound,
    Lock,
    Mail,
    MapPinHouse,
    Palette,
    Phone,
    Save,
    Shield,
    Users,
    Loader2
} from "lucide-react";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

type SettingsTab = "company" | "account" | "notifications" | "security" | "roles";

interface SettingsProps {
    onLogout?: () => void;
}

export default function Settings() {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState<SettingsTab>("company");

    const tabs: { key: SettingsTab; label: string; icon: React.ElementType }[] = [
        { key: "company", label: "Company Profile", icon: Building2 },
        { key: "account", label: "My Account", icon: CircleUserRound },
        { key: "notifications", label: "Notifications", icon: Bell },
        { key: "security", label: "Security", icon: Shield },
        { key: "roles", label: "Roles & Permissions", icon: Users },
    ];

    return (
        <main className="dashboard-page">
            <Sidebar onLogout={logout} activeItem="Settings" />

            <section className="dashboard-main text-gray-900">
                <Topbar title="Settings" />

                <div className="dashboard-content">
                    <div className="settings-layout">
                        {/* Settings Sidebar */}
                        <aside className="settings-sidebar">
                            <nav className="settings-nav">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        className={`settings-nav-item ${activeTab === tab.key ? "is-active" : ""}`}
                                        onClick={() => setActiveTab(tab.key)}
                                    >
                                        <tab.icon size={18} />
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </aside>

                        {/* Settings Content */}
                        <div className="settings-content">
                            {activeTab === "company" && <CompanyProfile />}
                            {activeTab === "account" && <MyAccount />}
                            {activeTab === "notifications" && <NotificationSettings />}
                            {activeTab === "security" && <SecuritySettings />}
                            {activeTab === "roles" && <RolesPermissions />}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

function CompanyProfile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState({
        companyName: "",
        companyEmail: "",
        companyPhone: "",
        companyAddress: "",
        companyWebsite: "",
        departments: ""
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/settings');
                setData({
                    ...res.data,
                    departments: res.data.departments?.join(", ") || ""
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/settings', {
                ...data,
                departments: data.departments.split(",").map(d => d.trim())
            });
            alert("Settings updated!");
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin inline mr-2" /> Loading...</div>;

    return (
        <div className="settings-panel bg-white p-6 rounded-xl shadow-sm">
            <div className="settings-panel-head mb-6">
                <h3 className="text-xl font-bold">Company Profile</h3>
                <p className="text-gray-500">Manage your business information as it appears to clients.</p>
            </div>

            <form onSubmit={handleSave} className="settings-form space-y-4">
                <div className="settings-form-row flex flex-col">
                    <label className="text-sm font-semibold mb-1 flex items-center" htmlFor="company-name">
                        <Building2 size={15} className="mr-2" />
                        Company Name
                    </label>
                    <input 
                        id="company-name" 
                        type="text" 
                        value={data.companyName}
                        onChange={e => setData({...data, companyName: e.target.value})}
                        className="border rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#222659]"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="settings-form-row flex flex-col">
                        <label className="text-sm font-semibold mb-1 flex items-center" htmlFor="company-email">
                            <Mail size={15} className="mr-2" />
                            Business Email
                        </label>
                        <input
                            id="company-email"
                            type="email"
                            value={data.companyEmail}
                            onChange={e => setData({...data, companyEmail: e.target.value})}
                            className="border rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#222659]"
                        />
                    </div>

                    <div className="settings-form-row flex flex-col">
                        <label className="text-sm font-semibold mb-1 flex items-center" htmlFor="company-phone">
                            <Phone size={15} className="mr-2" />
                            Phone Number
                        </label>
                        <input id="company-phone" type="text" value={data.companyPhone} onChange={e => setData({...data, companyPhone: e.target.value})} className="border rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#222659]" />
                    </div>
                </div>

                <div className="settings-form-row flex flex-col">
                    <label className="text-sm font-semibold mb-1 flex items-center" htmlFor="company-address">
                        <MapPinHouse size={15} className="mr-2" />
                        Address
                    </label>
                    <input
                        id="company-address"
                        type="text"
                        value={data.companyAddress}
                        onChange={e => setData({...data, companyAddress: e.target.value})}
                        className="border rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#222659]"
                    />
                </div>

                <div className="settings-form-row flex flex-col">
                    <label className="text-sm font-semibold mb-1 flex items-center" htmlFor="company-website">
                        <Globe size={15} className="mr-2" />
                        Website
                    </label>
                    <input
                        id="company-website"
                        type="url"
                        value={data.companyWebsite}
                        onChange={e => setData({...data, companyWebsite: e.target.value})}
                        className="border rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#222659]"
                    />
                </div>

                <div className="settings-form-row flex flex-col">
                    <label className="text-sm font-semibold mb-1 flex items-center" htmlFor="company-departments">
                        <Users size={15} className="mr-2" />
                        Departments (Comma separated)
                    </label>
                    <input
                        id="company-departments"
                        type="text"
                        value={data.departments}
                        onChange={e => setData({...data, departments: e.target.value})}
                        className="border rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#222659]"
                    />
                </div>

                <button type="submit" disabled={saving} className="settings-save-btn bg-[#222659] text-white py-2 px-6 rounded-lg font-bold hover:bg-[#1a1e46] flex items-center justify-center disabled:opacity-70">
                    {saving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={16} className="mr-2" />}
                    Save Changes
                </button>
            </form>
        </div>
    );
}

function MyAccount() {
    const { user, login } = useAuth();
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState(user?.name || "");
    const [phone, setPhone] = useState(user?.phone || "");

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.put('/auth/profile', { name, phone });
            login({ ...res.data, token: user?.token });
            alert("Account updated!");
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="settings-panel bg-white p-6 rounded-xl shadow-sm">
            <div className="settings-panel-head mb-6">
                <h3 className="text-xl font-bold">My Account</h3>
                <p className="text-gray-500">Update your personal information and preferences.</p>
            </div>

            <div className="settings-account-avatar-section flex items-center space-x-4 mb-8 p-4 bg-gray-50 rounded-xl">
                <div className="settings-avatar text-gray-400">
                    <CircleUserRound size={52} />
                </div>
                <div className="settings-avatar-info">
                    <h4 className="font-bold">{user?.name}</h4>
                    <p className="text-sm text-gray-500">{user?.role.toUpperCase()} &middot; {user?.email}</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="settings-form space-y-4">
                <div className="settings-form-row flex flex-col">
                    <label className="text-sm font-semibold mb-1" htmlFor="acc-name">Full Name</label>
                    <input id="acc-name" type="text" value={name} onChange={e => setName(e.target.value)} className="border rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#222659]" />
                </div>

                <div className="settings-form-row flex flex-col">
                    <label className="text-sm font-semibold mb-1" htmlFor="acc-email">Email Address</label>
                    <input
                        id="acc-email"
                        type="email"
                        value={user?.email}
                        disabled
                        className="border rounded-lg p-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                </div>

                <div className="settings-form-row flex flex-col">
                    <label className="text-sm font-semibold mb-1" htmlFor="acc-phone">Phone Number</label>
                    <input id="acc-phone" type="text" value={phone} onChange={e => setPhone(e.target.value)} className="border rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#222659]" />
                </div>

                <button type="submit" disabled={saving} className="settings-save-btn bg-[#222659] text-white py-2 px-6 rounded-lg font-bold hover:bg-[#1a1e46] flex items-center justify-center disabled:opacity-70">
                    {saving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={16} className="mr-2" />}
                    Save Changes
                </button>
            </form>
        </div>
    );
}

function NotificationSettings() {
    return (
        <div className="settings-panel bg-white p-6 rounded-xl shadow-sm text-gray-900">
            <div className="settings-panel-head mb-6">
                <h3 className="text-xl font-bold">Notifications</h3>
                <p className="text-gray-500">Configure how you receive alerts and updates.</p>
            </div>

            <div className="settings-toggles space-y-4">
                {[
                    { title: "New Service Requests", desc: "Receive a notification when a client submits a new service request." },
                    { title: "Contract Expiry Alerts", desc: "Get notified 30 days before a client contract is set to expire." },
                    { title: "Payment Received", desc: "Alert when a payment is processed for an outstanding invoice." },
                    { title: "Client Feedback Submitted", desc: "Notification when a client submits new feedback or a review." },
                ].map((item, i) => (
                    <div key={i} className="settings-toggle-row flex items-center justify-between p-4 border rounded-xl">
                        <div className="settings-toggle-info">
                            <h4 className="font-bold">{item.title}</h4>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked={i < 3} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#222659]"></div>
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SecuritySettings() {
    return (
        <div className="settings-panel bg-white p-6 rounded-xl shadow-sm text-gray-900">
            <div className="settings-panel-head mb-6">
                <h3 className="text-xl font-bold">Security</h3>
                <p className="text-gray-500">Manage password and account security settings.</p>
            </div>

            <form className="settings-form space-y-4 mb-8">
                <div className="settings-form-row flex flex-col">
                    <label className="text-sm font-semibold mb-1 flex items-center" htmlFor="current-password">
                        <Lock size={15} className="mr-2" />
                        Current Password
                    </label>
                    <input id="current-password" type="password" placeholder="Enter current password" className="border rounded-lg p-2 outline-none" />
                </div>

                <div className="settings-form-row flex flex-col">
                    <label className="text-sm font-semibold mb-1 flex items-center" htmlFor="new-password">
                        <KeyRound size={15} className="mr-2" />
                        New Password
                    </label>
                    <input id="new-password" type="password" placeholder="Enter new password" className="border rounded-lg p-2 outline-none" />
                </div>

                <button type="button" className="settings-save-btn bg-[#222659] text-white py-2 px-6 rounded-lg font-bold">
                    Update Password
                </button>
            </form>

            <div className="settings-security-section p-4 bg-red-50 border border-red-100 rounded-xl">
                <h4 className="font-bold text-red-900 flex items-center"><Shield size={16} className="mr-2" /> Advanced Security</h4>
                <p className="text-xs text-red-700 mt-1">Two-factor authentication and session management are handled by the system administrator.</p>
            </div>
        </div>
    );
}

function RolesPermissions() {
    const roles = [
        {
            name: "Super Admin",
            description: "Full system access including settings, user management, and all data.",
            users: 1,
            permissions: ["All Modules", "User Management", "Settings", "Reports", "Finances"],
        },
        {
            name: "Manager",
            description: "Can manage employees, service requests, and contracts. No settings access.",
            users: 2,
            permissions: ["Employees", "Service Requests", "Contracts", "Reports"],
        },
        {
            name: "Technician",
            description: "View and update assigned service requests. Limited dashboard access.",
            users: 5,
            permissions: ["Assigned Requests", "Dashboard"],
        },
        {
            name: "Client",
            description: "Self-service portal access for service requests, invoices, and feedback.",
            users: 12,
            permissions: ["Request Service", "Service Progress", "Contracts", "Invoices", "Feedback"],
        },
    ];

    return (
        <div className="settings-panel bg-white p-6 rounded-xl shadow-sm text-gray-900">
            <div className="settings-panel-head mb-6">
                <h3 className="text-xl font-bold">Roles & Permissions</h3>
                <p className="text-gray-500">Define access levels and permissions for each user role.</p>
            </div>

            <div className="settings-roles-grid grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map((role) => (
                    <div key={role.name} className="settings-role-card p-4 border rounded-xl hover:border-blue-200 transition-all">
                        <div className="role-card-head flex justify-between items-center mb-2">
                            <h4 className="font-bold">{role.name}</h4>
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{role.users} users</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-4 h-8 overflow-hidden">{role.description}</p>
                        <div className="role-permissions flex flex-wrap gap-1">
                            {role.permissions.slice(0, 3).map((perm) => (
                                <span key={perm} className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                    {perm}
                                </span>
                            ))}
                            {role.permissions.length > 3 && <span className="text-[10px] text-gray-400">+{role.permissions.length - 3} more</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
