import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Briefcase,
  ClipboardList,
  FileSignature,
  HandCoins,
  House,
  LogOut,
  SquareChartGantt,
  UserRound,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  caret?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: House, path: "/client/dashboard", caret: true },
  { label: "Request Service", icon: Briefcase, path: "/client/request-service" },
  { label: "Service Progress", icon: SquareChartGantt, path: "/client/service-progress" },
  { label: "Contracts", icon: FileSignature, path: "/client/contracts", caret: true },
  { label: "Invoices & Payments", icon: HandCoins, path: "/client/invoices-payments" },
  { label: "Feedback", icon: ClipboardList, path: "/client/feedback" },
  { label: "Profile", icon: UserRound, path: "/client/profile" },
];

interface ClientSidebarProps {
  onLogout?: () => void;
  activeItem?: string;
}

export default function ClientSidebar({ onLogout, activeItem }: ClientSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate("/login");
  };

  const isActive = (item: NavItem) => {
    if (activeItem) {
      return item.label === activeItem;
    }
    return location.pathname === item.path;
  };

  return (
    <aside className="dashboard-sidebar client-sidebar">
      <div className="sidebar-brand mb-4">
        <img src="/logo2.png" alt="ServiceFlow CRM" className="sidebar-logo" />
      </div>

      <nav className="sidebar-nav" aria-label="Client Sidebar">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`sidebar-link ${isActive(item) ? "is-active" : ""}`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
            {item.caret && <span className="sidebar-caret">&gt;</span>}
          </Link>
        ))}
      </nav>

      <button type="button" className="sidebar-logout" onClick={handleLogout}>
        <LogOut size={23} />
        <span>Logout</span>
      </button>
    </aside>
  );
}
