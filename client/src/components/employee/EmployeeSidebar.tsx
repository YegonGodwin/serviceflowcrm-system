import { useLayoutEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Calendar,
  CheckCircle,
  LayoutDashboard,
  LogOut,
  UserRound,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/employee/dashboard" },
    ],
  },
  {
    title: "Work",
    items: [
      { label: "My Tasks", icon: Briefcase, path: "/employee/tasks" },
      { label: "Schedule", icon: Calendar, path: "/employee/schedule" },
      { label: "Completed Jobs", icon: CheckCircle, path: "/employee/history" },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Earnings & Payslips", icon: LayoutDashboard, path: "/employee/earnings" },
      { label: "Profile", icon: UserRound, path: "/employee/profile" },
    ],
  },
];

interface EmployeeSidebarProps {
  onLogout?: () => void;
  activeItem?: string;
}

export default function EmployeeSidebar({ onLogout, activeItem }: EmployeeSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const activeLinkRef = useRef<HTMLAnchorElement>(null);

  useLayoutEffect(() => {
    if (activeLinkRef.current) {
      activeLinkRef.current.scrollIntoView({
        behavior: "auto",
        block: "nearest",
      });
    }
  }, [location.pathname, activeItem]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate("/login");
  };

  const isActive = (path: string, label: string) => {
    if (activeItem) {
      return label === activeItem;
    }
    return location.pathname === path;
  };

  return (
    <aside className="dashboard-sidebar employee-sidebar">
      <div className="sidebar-brand">
        <Link to="/employee/dashboard" className="brand-link">
          <img src="/logo2.png" alt="ServiceFlow CRM" className="sidebar-logo" />
        </Link>
      </div>

      <div className="sidebar-content">
        <nav className="sidebar-nav" aria-label="Employee Navigation">
          {navSections.map((section) => (
            <div key={section.title} className="nav-section">
              <h3 className="section-title">{section.title}</h3>
              <div className="section-items">
                {section.items.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    ref={isActive(item.path, item.label) ? activeLinkRef : null}
                    className={`sidebar-link ${isActive(item.path, item.label) ? "is-active" : ""}`}
                  >
                    <div className="link-icon">
                      <item.icon size={20} />
                    </div>
                    <span className="link-label">{item.label}</span>
                    {isActive(item.path, item.label) && (
                      <ChevronRight className="active-indicator" size={16} />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <button type="button" className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
