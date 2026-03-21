import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Briefcase,
  ClipboardList,
  FileText,
  HandCoins,
  House,
  LogOut,
  Settings,
  SquarePen,
  Users,
  UserSquare2,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ElementType;
  caret?: boolean;
  path: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: House, caret: true, path: "/admin/dashboard" },
  { label: "Employees", icon: UserSquare2, path: "/admin/employees" },
  { label: "Clients", icon: Users, path: "/admin/clients" },
  { label: "Service Request", icon: Briefcase, caret: true, path: "/admin/service-request" },
  { label: "Contracts", icon: SquarePen, path: "/admin/contracts" },
  { label: "Finances", icon: HandCoins, path: "/admin/finances" },
  { label: "Feedback", icon: ClipboardList, path: "/admin/feedback" },
  { label: "Reports", icon: FileText, path: "/admin/reports" },
  { label: "Settings", icon: Settings, path: "/admin/settings" },
];

interface SidebarProps {
  onLogout?: () => void;
  activeItem?: string;
}

export default function Sidebar({ onLogout, activeItem }: SidebarProps) {
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
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand mb-4">
        <img src="/logo2.png" alt="ServiceFlow CRM" className="sidebar-logo" />
      </div>

      <nav className="sidebar-nav" aria-label="Sidebar">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`sidebar-link ${isActive(item) ? "is-active" : ""}`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
            {item.caret && <span className="sidebar-caret">›</span>}
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
