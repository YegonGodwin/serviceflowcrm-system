import { MessageSquareText, Plus, Star, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Topbar from "../admin/Topbar";
import ClientSidebar from "./ClientSidebar";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function ClientFeedback() {
  const { logout } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [serviceRequest, setServiceRequest] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [feedbackRes, requestRes] = await Promise.all([
        api.get('/feedback'),
        api.get('/service-requests')
      ]);
      setFeedbacks(feedbackRes.data);
      setRequests(requestRes.data);
      if (requestRes.data.length > 0) {
        setServiceRequest(requestRes.data[0]._id);
      }
    } catch (err) {
      console.error("Error fetching feedback data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceRequest) return;
    
    setIsSubmitting(true);
    try {
      await api.post('/feedback', { serviceRequest, rating, message });
      setMessage("");
      setRating(5);
      fetchData();
    } catch (err) {
      console.error("Error submitting feedback:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="dashboard-page client-dashboard-page">
      <ClientSidebar onLogout={logout} activeItem="Feedback" />

      <section className="dashboard-main">
        <Topbar title="Feedback" />

        <div className="dashboard-content">
          <div className="client-feedback-grid">
            <section className="client-feedback-form-card">
              <div className="client-feedback-title">
                <h2 className="text-gray-900">Share Feedback</h2>
                <p className="text-gray-600">Let us know about your recent service experience.</p>
              </div>

              <form onSubmit={handleSubmit} className="client-feedback-form">
                <label className="text-gray-700" htmlFor="feedback-service">Service Request</label>
                <select 
                  id="feedback-service" 
                  value={serviceRequest}
                  onChange={(e) => setServiceRequest(e.target.value)}
                  className="bg-white border rounded-lg p-2 text-gray-900"
                  required
                >
                  {requests.map((req: any) => (
                    <option key={req._id} value={req._id}>{req.title}</option>
                  ))}
                  {requests.length === 0 && <option value="">No services found</option>}
                </select>

                <label className="text-gray-700 mt-4" htmlFor="feedback-message">Message</label>
                <textarea
                  id="feedback-message"
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your feedback here..."
                  className="bg-white border rounded-lg p-2 text-gray-900"
                  required
                />

                <label className="text-gray-700 mt-4" htmlFor="feedback-rating">Rating</label>
                <select 
                  id="feedback-rating" 
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="bg-white border rounded-lg p-2 text-gray-900"
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Average</option>
                  <option value="2">2 - Poor</option>
                  <option value="1">1 - Very Poor</option>
                </select>

                <button 
                  type="submit" 
                  disabled={isSubmitting || !serviceRequest}
                  className="client-feedback-submit bg-[#222659] text-white py-3 rounded-lg font-bold mt-6 hover:bg-[#1a1e46] disabled:opacity-50 flex items-center justify-center"
                >
                  {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <Plus size={18} className="mr-2" />}
                  Submit Feedback
                </button>
              </form>
            </section>

            <section className="client-feedback-list-card">
              <h3 className="text-gray-800">Recent Feedback History</h3>

              <div className="employees-table-container">
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                  </div>
                ) : (
                  <table className="employees-table client-request-table text-gray-900">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Service</th>
                        <th>Message</th>
                        <th>Rating</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feedbacks.map((entry: any) => (
                        <tr key={entry._id}>
                          <td className="font-mono text-xs">#{entry._id.slice(-6)}</td>
                          <td className="font-medium">{entry.serviceRequest?.title}</td>
                          <td className="max-w-xs truncate">{entry.message}</td>
                          <td>
                            <span className="client-feedback-rating flex items-center bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold">
                              <Star size={12} className="mr-1 fill-yellow-700" />
                              {entry.rating}.0
                            </span>
                          </td>
                          <td className="text-gray-500 text-xs">{new Date(entry.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {!isLoading && feedbacks.length === 0 && (
                <div className="request-empty py-12 flex flex-col items-center opacity-50">
                  <MessageSquareText size={32} />
                  <p className="mt-2 font-medium">No feedback submitted yet</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
