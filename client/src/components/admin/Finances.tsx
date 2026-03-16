import {
    ArrowDownRight,
    ArrowUpRight,
    DollarSign,
    Download,
    Filter,
    HandCoins,
    MoreVertical,
    Search,
    TrendingUp,
    Wallet,
    Loader2,
    Send,
    CheckCircle,
    Clock
} from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function Finances() {
    const { logout } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [earnings, setEarnings] = useState([]);
    const [earningStats, setEarningStats] = useState({ totalEarned: 0, available: 0, withdrawn: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("invoices");
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [invoicesRes, earningsRes] = await Promise.all([
                api.get('/invoices'),
                api.get('/earnings')
            ]);
            setInvoices(invoicesRes.data);
            setEarnings(earningsRes.data.earnings || []);
            setEarningStats(earningsRes.data.stats || { totalEarned: 0, available: 0, withdrawn: 0 });
        } catch (err) {
            console.error("Error fetching financial data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInitiatePayout = async (earningId: string) => {
        if (!window.confirm("Send commission payment to employee via M-Pesa?")) return;
        
        setIsProcessing(true);
        try {
            await api.post(`/earnings/${earningId}/payout`);
            alert("Payout initiated! The employee will receive an M-Pesa notification shortly.");
            fetchData();
        } catch (err: any) {
            console.error("Error initiating payout:", err);
            alert(err.response?.data?.message || "Failed to initiate payout.");
        } finally {
            setIsProcessing(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "paid":
            case "withdrawn":
            case "available":
                return "status-active";
            case "unpaid":
            case "pending":
                return "status-suspended";
            case "partially-paid":
                return "status-inprogress";
            case "failed":
                return "status-inactive";
            default:
                return "status-suspended";
        }
    };

    const stats = {
        totalRevenue: invoices.filter((i: any) => i.status === 'paid').reduce((acc, curr: any) => acc + curr.amount, 0),
        outstanding: invoices.filter((i: any) => i.status === 'unpaid').reduce((acc, curr: any) => acc + curr.amount, 0),
        outstandingCount: invoices.filter((i: any) => i.status === 'unpaid').length,
    };

    return (
        <main className="dashboard-page">
            <Sidebar onLogout={logout} activeItem="Finances" />

            <section className="dashboard-main">
                <Topbar title="Finances" />

                <div className="dashboard-content">
                    {/* Revenue Overview Cards */}
                    <div className="finances-stats mt-6">
                        <div className="finance-stat-card finance-stat-revenue">
                            <div className="finance-stat-icon-wrap revenue-icon">
                                <DollarSign size={22} />
                            </div>
                            <div className="finance-stat-body">
                                <div className="finance-stat-label">Total Revenue</div>
                                <div className="finance-stat-value">Ksh {stats.totalRevenue.toLocaleString()}</div>
                                <div className="finance-stat-change positive">
                                    <ArrowUpRight size={14} />
                                    <span>Live data</span>
                                </div>
                            </div>
                        </div>

                        <div className="finance-stat-card finance-stat-expenses">
                            <div className="finance-stat-icon-wrap expenses-icon">
                                <ArrowDownRight size={22} className="text-red-600" />
                            </div>
                            <div className="finance-stat-body">
                                <div className="finance-stat-label">Total Payouts</div>
                                <div className="finance-stat-value text-red-600">Ksh {earningStats.withdrawn.toLocaleString()}</div>
                                <div className="finance-stat-subtext text-xs">Sent to employees</div>
                            </div>
                        </div>

                        <div className="finance-stat-card finance-stat-outstanding">
                            <div className="finance-stat-icon-wrap outstanding-icon">
                                <HandCoins size={22} />
                            </div>
                            <div className="finance-stat-body">
                                <div className="finance-stat-label">Pending Payouts</div>
                                <div className="finance-stat-value text-yellow-600">Ksh {earningStats.available.toLocaleString()}</div>
                                <div className="finance-stat-subtext text-xs">Available for withdrawal</div>
                            </div>
                        </div>

                        <div className="finance-stat-card finance-stat-profit">
                            <div className="finance-stat-icon-wrap profit-icon">
                                <TrendingUp size={22} />
                            </div>
                            <div className="finance-stat-body">
                                <div className="finance-stat-label">Net Profit</div>
                                <div className="finance-stat-value text-green-700">Ksh {(stats.totalRevenue - earningStats.withdrawn).toLocaleString()}</div>
                                <div className="finance-stat-change positive text-[10px] font-bold">
                                    AFTER EMPLOYEE COMMISSIONS
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="finances-table-section mt-8">
                        <div className="flex items-center space-x-6 mb-6 border-b border-gray-100">
                            <button 
                                onClick={() => setActiveTab("invoices")}
                                className={`pb-3 text-sm font-bold transition-all ${activeTab === "invoices" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600"}`}
                            >
                                Client Invoices
                            </button>
                            <button 
                                onClick={() => setActiveTab("payouts")}
                                className={`pb-3 text-sm font-bold transition-all ${activeTab === "payouts" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600"}`}
                            >
                                Employee Payouts
                            </button>
                        </div>

                        <div className="finances-header !mt-0 !mb-6">
                            <div className="search-box">
                                <Search size={18} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder={activeTab === "invoices" ? "Search invoices" : "Search employees"}
                                    className="search-input"
                                />
                            </div>

                            <div className="finances-actions">
                                <button type="button" className="btn-filter">
                                    <Filter size={18} />
                                    Filter
                                </button>
                                <button type="button" className="btn-add-employee">
                                    <Download size={18} />
                                    Export CSV
                                </button>
                            </div>
                        </div>

                        <div className="employees-table-container">
                            {isLoading ? (
                                <div className="flex justify-center p-12">
                                    <Loader2 className="animate-spin text-blue-600" size={40} />
                                </div>
                            ) : activeTab === "invoices" ? (
                                <table className="employees-table finances-table">
                                    <thead>
                                        <tr>
                                            <th>Invoice #</th>
                                            <th>Description</th>
                                            <th>Client</th>
                                            <th>Amount</th>
                                            <th>Due Date</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices.map((inv: any) => (
                                            <tr key={inv._id}>
                                                <td className="font-mono text-xs">{inv.invoiceNumber}</td>
                                                <td>{inv.serviceRequest?.title || inv.contract?.title || "Service Payment"}</td>
                                                <td>
                                                    <div className="requester-info text-gray-900">
                                                        <div className="requester-name font-medium">{inv.client?.name}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="finance-amount font-bold text-gray-900">
                                                        Ksh {inv.amount.toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="text-gray-600">{new Date(inv.dueDate).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`status-badge ${getStatusColor(inv.status)}`}>
                                                        {inv.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <table className="employees-table finances-table">
                                    <thead>
                                        <tr>
                                            <th>Employee</th>
                                            <th>Service Task</th>
                                            <th>Commission</th>
                                            <th>Total Inv.</th>
                                            <th>Created On</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {earnings.map((earn: any) => (
                                            <tr key={earn._id}>
                                                <td className="font-medium text-gray-900">{earn.employee?.name}</td>
                                                <td className="text-sm">{earn.serviceRequest?.title}</td>
                                                <td>
                                                    <span className="text-green-600 font-bold">
                                                        Ksh {earn.commissionAmount.toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="text-gray-500 text-xs">Ksh {earn.totalAmount.toLocaleString()}</td>
                                                <td className="text-gray-600 text-xs">{new Date(earn.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`status-badge ${getStatusColor(earn.status)}`}>
                                                        {earn.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {earn.status === 'available' ? (
                                                        <button 
                                                            onClick={() => handleInitiatePayout(earn._id)}
                                                            disabled={isProcessing}
                                                            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded hover:bg-blue-700 transition-colors shadow-sm disabled:bg-gray-400"
                                                        >
                                                            <Send size={12} /> Send Ksh
                                                        </button>
                                                    ) : earn.status === 'withdrawn' ? (
                                                        <span className="text-green-600 font-bold text-[10px] flex items-center gap-1">
                                                            <CheckCircle size={12} /> Paid Out
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 font-bold text-[10px] flex items-center gap-1">
                                                            <Clock size={12} /> Awaiting Confirmation
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {earnings.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="text-center py-8 text-gray-500">No payout records found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
