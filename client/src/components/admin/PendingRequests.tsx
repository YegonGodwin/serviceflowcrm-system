import { ClipboardList, Loader2, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function PendingRequests() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const response = await api.get('/service-requests');
        setRequests(response.data.filter((r: any) => r.status === 'pending'));
      } catch (err) {
        console.error("Error fetching pending requests:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPending();
  }, []);

  return (
    <section className="requests-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-900 font-bold">Pending Requests</h3>
        <button 
          onClick={() => navigate('/admin/service-request')}
          className="text-xs text-[#F26323] font-bold hover:underline flex items-center"
        >
          View All <ChevronRight size={14} />
        </button>
      </div>
      <div className="request-head grid grid-cols-4 gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b">
        <span>ID</span>
        <span>Service</span>
        <span>Requester</span>
        <span>Date</span>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-6">
          <Loader2 className="animate-spin text-gray-400" />
        </div>
      ) : requests.length > 0 ? (
        <div className="request-list max-h-48 overflow-y-auto mt-2">
          {requests.map((req: any) => (
            <div 
              key={req._id} 
              onClick={() => navigate('/admin/service-request')}
              className="grid grid-cols-4 gap-2 py-3 border-b border-gray-50 text-xs items-center cursor-pointer hover:bg-gray-50 transition-colors group"
            >
              <span className="font-mono text-gray-500">#{req._id.slice(-6)}</span>
              <span className="font-medium text-gray-900 truncate group-hover:text-[#F26323] transition-colors">{req.title}</span>
              <span className="text-gray-600 truncate">{req.client?.name}</span>
              <span className="text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="request-empty py-8 flex flex-col items-center opacity-40">
          <ClipboardList size={22} />
          <p className="mt-2 font-medium">No pending records</p>
        </div>
      )}
    </section>
  );
}
