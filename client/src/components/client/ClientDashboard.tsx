import { Briefcase, CircleUserRound, List, Loader2, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../admin/Topbar";
import ClientSidebar from "./ClientSidebar";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [requests, setRequests] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [requestsRes, invoicesRes, feedbacksRes] = await Promise.all([
          api.get('/service-requests'),
          api.get('/invoices'),
          api.get('/feedback')
        ]);
        setRequests(requestsRes.data);
        setInvoices(invoicesRes.data.filter((inv: any) => inv.status === 'unpaid'));
        setFeedbacks(feedbacksRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, "0");
  const dayName = time.toLocaleDateString("en-US", { weekday: "long" });

  return (
    <main className="dashboard-page client-dashboard-page">
      <ClientSidebar onLogout={logout} activeItem="Dashboard" />

      <section className="dashboard-main">
        <Topbar title="Dashboard" />

        <div className="dashboard-content">
          <div className="client-dashboard-head">
            <h2>Welcome, {user?.name}</h2>
            <div className="content-time">
              <strong>
                {displayHours}:{displayMinutes}
              </strong>
              <span>{ampm}</span>
              <p>{dayName}</p>
            </div>
          </div>

          <div className="client-dashboard-grid">
            <div className="client-dashboard-left">
              <section 
                onClick={() => navigate('/client/profile')}
                className="client-profile-card cursor-pointer hover:shadow-md transition-all group"
              >
                <div className="client-profile-avatar text-gray-500 group-hover:text-[#F26323] transition-colors">
                  <CircleUserRound size={46} />
                </div>
                <div className="client-profile-copy">
                  <h3 className="text-gray-900 group-hover:text-[#F26323] transition-colors">{user?.name}</h3>
                  <p className="text-gray-600">{user?.role.toUpperCase()}</p>
                </div>
                <ChevronRight className="ml-auto text-gray-300 group-hover:text-[#F26323] transition-colors" size={20} />
              </section>

              <section 
                onClick={() => navigate('/client/invoices-payments')}
                className="client-invoices-card cursor-pointer hover:shadow-md transition-all group"
              >
                <div className="client-invoices-icon group-hover:bg-[#F26323] transition-colors">
                  <Briefcase size={20} />
                </div>
                <div className="client-invoices-label">Outstanding Invoices</div>
                <div className="client-invoices-value group-hover:text-[#F26323] transition-colors">{invoices.length}</div>
                <ChevronRight className="ml-auto text-gray-300 group-hover:text-[#F26323] transition-colors" size={20} />
              </section>

              <section 
                onClick={() => navigate('/client/feedback')}
                className="client-invoices-card mt-6 !bg-green-50 cursor-pointer hover:shadow-md transition-all group"
              >
                <div className="client-invoices-icon !bg-green-600 group-hover:!bg-green-700 transition-colors">
                  <List size={20} />
                </div>
                <div className="client-invoices-label">Recent Feedback</div>
                <div className="client-invoices-value !text-green-700 group-hover:!text-green-800 transition-colors">{feedbacks.length}</div>
                <div className="mt-2 text-[10px] text-green-600 font-medium w-full">
                  {feedbacks.length > 0 ? `Latest: ${feedbacks[0].rating} stars` : "No feedback yet"}
                </div>
              </section>
            </div>

            <section className="client-jobs-card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-800 font-bold">Current Jobs Status</h3>
                <button 
                  onClick={() => navigate('/client/service-progress')}
                  className="text-xs text-[#F26323] font-bold hover:underline"
                >
                  View All
                </button>
              </div>
              
              <div className="request-head">
                <span className="text-gray-700">Request ID</span>
                <span className="text-gray-700">Description</span>
                <span className="text-gray-700">Status</span>
                <span className="text-gray-700">Requested On</span>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="animate-spin text-gray-400" />
                </div>
              ) : requests.length > 0 ? (
                <div className="request-list max-h-64 overflow-y-auto">
                  {requests.map((req: any) => (
                    <div 
                      key={req._id} 
                      onClick={() => navigate('/client/service-progress')}
                      className="request-item grid grid-cols-4 p-4 border-b border-gray-100 text-sm cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-mono text-gray-600">#{req._id.slice(-6)}</span>
                      <span className="text-gray-800 truncate px-2">{req.title}</span>
                      <span className={`px-2 py-1 rounded-full text-xs text-center w-fit ${
                        req.status === 'completed' ? 'bg-green-100 text-green-700' :
                        req.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {req.status}
                      </span>
                      <span className="text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="request-empty client-jobs-empty">
                  <List size={22} className="text-gray-400" />
                  <p className="text-gray-500">No record found</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
