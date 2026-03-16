import { Users, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProfileCard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  return (
    <section 
      onClick={() => navigate('/admin/settings')}
      className="profile-card cursor-pointer hover:shadow-md hover:border-[#F26323]/30 transition-all group relative overflow-hidden"
    >
      <div className="profile-avatar text-gray-400 group-hover:text-[#F26323] transition-colors">
        <Users size={48} />
      </div>
      <div className="profile-copy">
        <h3 className="text-gray-900 font-bold group-hover:text-[#F26323] transition-colors">{user?.name}</h3>
        <p className="text-gray-500 font-mono text-xs">ID - #{user?._id.slice(-6)}</p>
        <p className="text-xs text-[#F26323] font-bold mt-1 uppercase tracking-wider">{user?.role}</p>
      </div>
      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-200 group-hover:text-[#F26323] transition-colors" size={24} />
    </section>
  );
}
