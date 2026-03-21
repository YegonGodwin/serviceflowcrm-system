import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Calendar,
  CheckCircle,
  House,
  LogOut,
  UserRound,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  caret?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: House, path: "/employee/dashboard", caret: true },
  { label: "My Tasks", icon: Briefcase, path: "/employee/tasks" },
  { label: "Schedule", icon: Calendar, path: "/employee/schedule" },
  { label: "Completed Jobs", icon: CheckCircle, path: "/employee/history" },
  { label: "Profile", icon: UserRound, path: "/employee/profile" },
];

interface EmployeeSidebarProps {
  onLogout?: () => void;
  activeItem?: string;
}

export default function EmployeeSidebar({ onLogout, activeItem }: EmployeeSidebarProps) {
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
    <aside className="dashboard-sidebar employee-sidebar">
      <div className="sidebar-brand mb-4">
        <img src="/logo2.png" alt="ServiceFlow CRM" className="sidebar-logo" />
      </div>

      <nav className="sidebar-nav" aria-label="Employee Sidebar">
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
