import {
    ArrowDownRight,
    ArrowUpRight,
    DollarSign,
    Download,
    Filter,
    HandCoins,
    Search,
    TrendingUp,
    Loader2,
    Send,
    CheckCircle,
    Clock,
    Calendar,
    RefreshCw
} from "lucide-react";
import { downloadInvoicePDF } from "../../lib/downloadInvoice";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function Finances() {
    const { logout } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [earnings, setEarnings] = useState([]);
    const [payrolls, setPayrolls] = useState([]);
    const [earningStats, setEarningStats] = useState({ totalEarned: 0, available: 0, withdrawn: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("invoices");
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Payroll filters
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [invoicesRes, earningsRes, payrollsRes] = await Promise.all([
                api.get('/invoices'),
                api.get('/earnings'),
                api.get(`/earnings/payroll?month=${selectedMonth}&year=${selectedYear}`)
            ]);
            setInvoices(invoicesRes.data);
            setEarnings(earningsRes.data.earnings || []);
            setEarningStats(earningsRes.data.stats || { totalEarned: 0, available: 0, withdrawn: 0 });
            setPayrolls(payrollsRes.data || []);
        } catch (err) {
            console.error("Error fetching financial data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedMonth, selectedYear]);

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

    const handleGeneratePayroll = async () => {
        setIsProcessing(true);
        try {
            const res = await api.post('/earnings/payroll', { month: selectedMonth, year: selectedYear });
            alert(res.data.message);
            fetchData();
        } catch (err: any) {
            console.error("Error generating payroll:", err);
            alert(err.response?.data?.message || "No available earnings found for this period to generate payroll.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleExecutePayroll = async (payrollId: string) => {
        if (!window.confirm("Disburse this monthly payment to the employee via M-Pesa?")) return;
        
        setIsProcessing(true);
        try {
            await api.post(`/earnings/payroll/${payrollId}/execute`);
            alert("Monthly payout initiated successfully!");
            fetchData();
        } catch (err: any) {
            console.error("Error executing monthly payout:", err);
            alert(err.response?.data?.message || "Failed to execute monthly payout.");
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
            case "processing":
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

    const months = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];

    const years = [2024, 2025, 2026];

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
                                    AFTER EMPLOYEE PAYOUTS
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
                                onClick={() => setActiveTab("payroll")}
                                className={`pb-3 text-sm font-bold transition-all ${activeTab === "payroll" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600"}`}
                            >
                                Monthly Payroll
                            </button>
                            <button 
                                onClick={() => setActiveTab("payouts")}
                                className={`pb-3 text-sm font-bold transition-all ${activeTab === "payouts" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600"}`}
                            >
                                Payout History
                            </button>
                        </div>

                        <div className="finances-header !mt-0 !mb-6">
                            <div className="flex items-center gap-4">
                                {activeTab === "payroll" ? (
                                    <div className="flex items-center gap-2">
                                        <select 
                                            value={selectedMonth} 
                                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {months.map((m, i) => (
                                                <option key={i} value={i + 1}>{m}</option>
                                            ))}
                                        </select>
                                        <select 
                                            value={selectedYear} 
                                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {years.map(y => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </select>
                                        <button 
                                            onClick={handleGeneratePayroll}
                                            disabled={isProcessing}
                                            className="btn-add-employee !bg-blue-600 !text-white hover:!bg-blue-700"
                                        >
                                            <RefreshCw size={18} className={isProcessing ? "animate-spin" : ""} />
                                            Generate Payroll
                                        </button>
                                    </div>
                                ) : (
                                    <div className="search-box">
                                        <Search size={18} className="search-icon" />
                                        <input
                                            type="text"
                                            placeholder={activeTab === "invoices" ? "Search invoices" : "Search employees"}
                                            className="search-input"
                                        />
                                    </div>
                                )}
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
                                            <th></th>
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
                                                <td>
                                                    <button
                                                        onClick={() => downloadInvoicePDF(inv)}
                                                        title="Download Invoice PDF"
                                                        className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                                                    >
                                                        <Download size={13} /> PDF
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : activeTab === "payroll" ? (
                                <table className="employees-table finances-table">
                                    <thead>
                                        <tr>
                                            <th>Employee</th>
                                            <th>Month</th>
                                            <th>Tasks</th>
                                            <th>Total Payout</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payrolls.map((payroll: any) => (
                                            <tr key={payroll._id}>
                                                <td>
                                                    <div className="font-medium text-gray-900">{payroll.employee?.name}</div>
                                                    <div className="text-[10px] text-gray-500">{payroll.employee?.position}</div>
                                                </td>
                                                <td>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar size={12} className="text-gray-400" />
                                                        {months[payroll.month - 1]} {payroll.year}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="px-2 py-0.5 bg-gray-100 rounded-full text-[10px] font-bold text-gray-600">
                                                        {payroll.earnings?.length || 0} tasks
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="text-green-600 font-bold">
                                                        Ksh {payroll.totalAmount.toLocaleString()}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${getStatusColor(payroll.status)}`}>
                                                        {payroll.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {payroll.status === 'pending' || payroll.status === 'failed' ? (
                                                        <button 
                                                            onClick={() => handleExecutePayroll(payroll._id)}
                                                            disabled={isProcessing}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-[10px] font-bold rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:bg-gray-400"
                                                        >
                                                            <Send size={12} /> Disburse via M-Pesa
                                                        </button>
                                                    ) : payroll.status === 'processing' ? (
                                                        <span className="text-blue-600 font-bold text-[10px] flex items-center gap-1">
                                                            <Clock size={12} /> Processing...
                                                        </span>
                                                    ) : (
                                                        <span className="text-green-600 font-bold text-[10px] flex items-center gap-1">
                                                            <CheckCircle size={12} /> Paid
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {payrolls.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="text-center py-12">
                                                    <div className="text-gray-400 mb-2 font-medium">No payroll data for this period.</div>
                                                    <button 
                                                        onClick={handleGeneratePayroll}
                                                        className="text-blue-600 text-sm font-bold hover:underline"
                                                    >
                                                        Click here to generate payroll
                                                    </button>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            ) : (
                                <table className="employees-table finances-table">
                                    <thead>
                                        <tr>
                                            <th>Employee</th>
                                            <th>Service Task</th>
                                            <th>Earned Amount</th>
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
