import { CirclePlus, FileText, Menu, Power, Search, Settings } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import NotificationDropdown from "../NotificationDropdown";

interface TopbarProps {
  title?: string;
}

export default function Topbar({ title = "Dashboard" }: TopbarProps) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { toggle } = useSidebar();

  const handlePlusClick = () => {
    if (user?.role === 'admin') {
      navigate('/admin/service-request');
    } else if (user?.role === 'client') {
      navigate('/client/request-service');
    }
  };

  const handleSettingsClick = () => {
    if (user?.role === 'admin') {
      navigate('/admin/settings');
    } else if (user?.role === 'client') {
      navigate('/client/profile');
    } else {
      navigate('/employee/profile');
    }
  };

  return (
    <header className="dashboard-topbar">
      <button 
        className="hamburger-btn" 
        onClick={toggle}
        aria-label="Toggle Sidebar"
      >
        <Menu size={24} />
      </button>
      <h1>{title}</h1>
      <div className="topbar-icons" aria-label="Toolbar">
        <button 
          type="button" 
          aria-label="Search"
          className="hover:text-[#F26323] transition-colors"
          title="Search"
        >
          <Search size={22} />
        </button>
        <button 
          type="button" 
          aria-label="Documents"
          className="hover:text-[#F26323] transition-colors"
          title="Documents"
          onClick={() => navigate(user?.role === 'admin' ? '/admin/reports' : '/client/contracts')}
        >
          <FileText size={21} />
        </button>
        <button 
          type="button" 
          aria-label="Add New"
          className="hover:text-[#F26323] transition-colors"
          title="Add New"
          onClick={handlePlusClick}
        >
          <CirclePlus size={22} />
        </button>
        
        <NotificationDropdown />

        <button 
          type="button" 
          aria-label="Settings"
          className="hover:text-[#F26323] transition-colors"
          title="Settings"
          onClick={handleSettingsClick}
        >
          <Settings size={22} />
        </button>
        <button 
          type="button" 
          aria-label="Logout"
          className="hover:text-red-500 transition-colors"
          title="Logout"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          <Power size={23} />
        </button>
      </div>
    </header>
  );
}
