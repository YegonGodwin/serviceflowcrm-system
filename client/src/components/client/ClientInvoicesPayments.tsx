import { AlignJustify, Briefcase, CircleAlert, Filter, Loader2, CreditCard, CheckCircle, Smartphone, X } from "lucide-react";
import Topbar from "../admin/Topbar";
import ClientSidebar from "./ClientSidebar";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function ClientInvoicesPayments() {
  const { logout } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [phone, setPhone] = useState("");
  const [showPhoneInput, setShowPhoneInput] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/invoices');
      setInvoices(response.data);
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleMpesaPay = async (invoiceId: string) => {
    if (!phone) {
      alert("Please enter your M-Pesa phone number (e.g., 0712345678)");
      return;
    }
    setIsPaying(true);
    try {
      await api.post(`/invoices/${invoiceId}/mpesa-pay`, { phone });
      alert("STK Push sent! Please check your phone and enter your M-Pesa PIN.");
      setShowPhoneInput(null);
      // Start a timer to refresh invoices after 30 seconds to check for payment
      setTimeout(fetchInvoices, 30000);
    } catch (err: any) {
      console.error("Error initiating M-Pesa payment:", err);
      alert(err.response?.data?.message || "M-Pesa payment failed.");
    } finally {
      setIsPaying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid": return "status-active";
      case "unpaid": return "status-suspended";
      case "partially-paid": return "status-inprogress";
      default: return "status-suspended";
    }
  };

  const stats = {
    total: invoices.length,
    paid: invoices.filter((i: any) => i.status === 'paid').length,
    unpaid: invoices.filter((i: any) => i.status === 'unpaid').length,
    partiallyPaid: invoices.filter((i: any) => i.status === 'partially-paid').length,
  };

  return (
    <main className="dashboard-page client-dashboard-page">
      <ClientSidebar onLogout={logout} activeItem="Invoices & Payments" />

      <section className="dashboard-main">
        <Topbar title="Invoices & Payments" />

        <div className="dashboard-content">
          <div className="client-request-header">
            <button type="button" className="client-btn-unpaid-invoices">
              <CircleAlert size={16} />
              {stats.unpaid} Unpaid Invoices
            </button>

            <div className="client-request-actions">
              <button type="button" className="btn-filter">
                <Filter size={18} />
                Filter
              </button>
            </div>
          </div>

          <div className="client-request-stats client-invoice-stats">
            <div className="client-request-stat-card">
              <div className="client-request-stat-icon"><Briefcase size={18} /></div>
              <div className="client-request-stat-info">
                <div className="client-request-stat-label">Total Invoices</div>
                <div className="client-request-stat-value">{stats.total}</div>
              </div>
            </div>
            <div className="client-request-stat-card">
              <div className="client-request-stat-icon text-green-600"><CheckCircle size={18} /></div>
              <div className="client-request-stat-info">
                <div className="client-request-stat-label">Paid Invoices</div>
                <div className="client-request-stat-value">{stats.paid}</div>
              </div>
            </div>
            <div className="client-request-stat-card">
              <div className="finance-stat-icon-wrap outstanding-icon text-red-600 !bg-transparent border-none">
                 <Smartphone size={24} />
              </div>
              <div className="client-request-stat-info">
                <div className="client-request-stat-label">Unpaid</div>
                <div className="client-request-stat-value">{stats.unpaid}</div>
              </div>
            </div>
          </div>

          <div className="employees-table-container client-contracts-table-wrap">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="animate-spin text-blue-600" size={40} />
              </div>
            ) : (
              <table className="employees-table client-request-table">
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((entry: any) => (
                    <tr key={entry._id}>
                      <td className="font-mono text-xs text-blue-600">{entry.invoiceNumber}</td>
                      <td>
                        <div className="font-medium">{entry.serviceRequest?.title || entry.contract?.title || "Service Payment"}</div>
                        {entry.paymentDate && <div className="text-[10px] text-gray-400">Paid on: {new Date(entry.paymentDate).toLocaleDateString()} ({entry.paymentMethod})</div>}
                        {entry.mpesaReceiptNumber && <div className="text-[10px] text-green-600">Receipt: {entry.mpesaReceiptNumber}</div>}
                      </td>
                      <td className="font-bold text-gray-900">Ksh {entry.amount.toLocaleString()}</td>
                      <td className="text-gray-500 text-sm">{new Date(entry.dueDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${getStatusColor(entry.status)}`}>
                          {entry.status}
                        </span>
                      </td>
                      <td>
                        {entry.status === 'unpaid' ? (
                          <div className="flex flex-col gap-2">
                            {showPhoneInput === entry._id ? (
                              <div className="flex flex-col gap-1 p-2 bg-gray-50 rounded border border-gray-200">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[10px] font-bold text-gray-600 uppercase">M-Pesa Number</span>
                                  <button onClick={() => setShowPhoneInput(null)} className="text-gray-400 hover:text-gray-600">
                                    <X size={12} />
                                  </button>
                                </div>
                                <input 
                                  type="text" 
                                  value={phone}
                                  onChange={(e) => setPhone(e.target.value)}
                                  placeholder="07XXXXXXXX"
                                  className="text-xs p-1 border rounded"
                                  autoFocus
                                />
                                <button 
                                  onClick={() => handleMpesaPay(entry._id)}
                                  disabled={isPaying}
                                  className="w-full bg-[#3FB14E] text-white text-[10px] font-bold py-1 rounded hover:bg-[#369a43] transition-colors"
                                >
                                  {isPaying ? "Processing..." : "Confirm Payment"}
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => {
                                  setPhone(entry.client?.phone || "");
                                  setShowPhoneInput(entry._id);
                                }}
                                disabled={isPaying}
                                className="flex items-center gap-1 px-3 py-1 bg-[#3FB14E] text-white text-xs font-bold rounded hover:bg-[#369a43] transition-colors shadow-sm"
                              >
                                <Smartphone size={14} /> Pay via M-Pesa
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-green-600 font-bold text-xs flex items-center gap-1">
                            <CheckCircle size={14} /> Paid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500 font-medium">No invoice records found.</td>
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
