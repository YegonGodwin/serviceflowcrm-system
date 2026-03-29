import {
    DollarSign,
    TrendingUp,
    Wallet,
    Loader2,
    CheckCircle,
    Clock,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    ChevronRight,
    Search,
    Filter
} from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar";
import Topbar from "../admin/Topbar";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function EmployeeEarnings() {
    const { logout } = useAuth();
    const [earnings, setEarnings] = useState([]);
    const [payrolls, setPayrolls] = useState([]);
    const [stats, setStats] = useState({ totalEarned: 0, available: 0, withdrawn: 0, pending: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("payrolls");

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [earningsRes, payrollsRes] = await Promise.all([
                api.get('/earnings'),
                api.get('/earnings/payroll')
            ]);
            setEarnings(earningsRes.data.earnings || []);
            setStats(earningsRes.data.stats || { totalEarned: 0, available: 0, withdrawn: 0, pending: 0 });
            setPayrolls(payrollsRes.data || []);
        } catch (err) {
            console.error("Error fetching financial data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "paid":
            case "withdrawn":
            case "available":
                return "bg-green-100 text-green-700";
            case "pending":
            case "processing":
                return "bg-blue-100 text-blue-700";
            case "failed":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const months = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <main className="dashboard-page">
            <EmployeeSidebar onLogout={logout} activeItem="Earnings & Payslips" />

            <section className="dashboard-main">
                <Topbar title="My Earnings" />

                <div className="dashboard-content">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <TrendingUp className="text-green-600" size={20} />
                                </div>
                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">LIFETIME</span>
                            </div>
                            <p className="text-sm text-gray-500 font-medium">Total Earned</p>
                            <p className="text-2xl font-bold text-gray-900">Ksh {stats.totalEarned.toLocaleString()}</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Wallet className="text-blue-600" size={20} />
                                </div>
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">ACCUMULATING</span>
                            </div>
                            <p className="text-sm text-gray-500 font-medium">Available for Payout</p>
                            <p className="text-2xl font-bold text-gray-900">Ksh {stats.available.toLocaleString()}</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <CheckCircle className="text-purple-600" size={20} />
                                </div>
                                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">TRANSFERRED</span>
                            </div>
                            <p className="text-sm text-gray-500 font-medium">Total Withdrawn</p>
                            <p className="text-2xl font-bold text-gray-900">Ksh {stats.withdrawn.toLocaleString()}</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-orange-50 rounded-lg">
                                    <Clock className="text-orange-600" size={20} />
                                </div>
                                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">UPCOMING</span>
                            </div>
                            <p className="text-sm text-gray-500 font-medium">Pending Confirmation</p>
                            <p className="text-2xl font-bold text-gray-900">Ksh {stats.pending.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex items-center space-x-6 px-6 pt-6 border-b border-gray-100">
                            <button 
                                onClick={() => setActiveTab("payrolls")}
                                className={`pb-4 text-sm font-bold transition-all relative ${activeTab === "payrolls" ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
                            >
                                Monthly Payslips
                                {activeTab === "payrolls" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
                            </button>
                            <button 
                                onClick={() => setActiveTab("earnings")}
                                className={`pb-4 text-sm font-bold transition-all relative ${activeTab === "earnings" ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
                            >
                                Service Payouts
                                {activeTab === "earnings" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
                            </button>
                        </div>

                        <div className="p-6">
                            {isLoading ? (
                                <div className="flex justify-center p-12">
                                    <Loader2 className="animate-spin text-blue-600" size={32} />
                                </div>
                            ) : activeTab === "payrolls" ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-gray-400 text-[11px] uppercase tracking-wider border-b border-gray-100">
                                                <th className="pb-4 font-bold">Month / Year</th>
                                                <th className="pb-4 font-bold">Tasks Count</th>
                                                <th className="pb-4 font-bold">Amount</th>
                                                <th className="pb-4 font-bold">Status</th>
                                                <th className="pb-4 font-bold">Payout Date</th>
                                                <th className="pb-4 font-bold">M-Pesa Ref</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {payrolls.map((payroll: any) => (
                                                <tr key={payroll._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                                <Calendar size={18} />
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-gray-900">{months[payroll.month - 1]}</div>
                                                                <div className="text-xs text-gray-500">{payroll.year}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-5">
                                                        <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-600">
                                                            {payroll.earnings?.length || 0} services
                                                        </span>
                                                    </td>
                                                    <td className="py-5 font-bold text-gray-900">
                                                        Ksh {payroll.totalAmount.toLocaleString()}
                                                    </td>
                                                    <td className="py-5">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${getStatusColor(payroll.status)}`}>
                                                            {payroll.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="py-5 text-sm text-gray-600">
                                                        {payroll.payoutDate ? new Date(payroll.payoutDate).toLocaleDateString() : "-"}
                                                    </td>
                                                    <td className="py-5 text-xs font-mono text-gray-500">
                                                        {payroll.payoutReceiptNumber || "-"}
                                                    </td>
                                                </tr>
                                            ))}
                                            {payrolls.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="text-center py-12 text-gray-500 italic">No monthly payslips found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-gray-400 text-[11px] uppercase tracking-wider border-b border-gray-100">
                                                <th className="pb-4 font-bold">Service Task</th>
                                                <th className="pb-4 font-bold">Total Amount</th>
                                                <th className="pb-4 font-bold">Earned Amount</th>
                                                <th className="pb-4 font-bold">Status</th>
                                                <th className="pb-4 font-bold">Earned Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {earnings.map((earn: any) => (
                                                <tr key={earn._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="py-5">
                                                        <div className="font-bold text-gray-900">{earn.serviceRequest?.title}</div>
                                                        <div className="text-[10px] text-gray-500">INV: {earn.invoice?.invoiceNumber}</div>
                                                    </td>
                                                    <td className="py-5 text-sm text-gray-600">
                                                        Ksh {earn.totalAmount.toLocaleString()}
                                                    </td>
                                                    <td className="py-5 font-bold text-green-600">
                                                        Ksh {earn.commissionAmount.toLocaleString()}
                                                    </td>
                                                    <td className="py-5">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(earn.status)}`}>
                                                            {earn.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-5 text-sm text-gray-500">
                                                        {new Date(earn.createdAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                            {earnings.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="text-center py-12 text-gray-500 italic">No service payouts found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
