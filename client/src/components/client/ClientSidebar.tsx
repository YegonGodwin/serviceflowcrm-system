import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Briefcase,
  ClipboardList,
  FileSignature,
  HandCoins,
  LayoutDashboard,
  LogOut,
  SquareChartGantt,
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
      { label: "Dashboard", icon: LayoutDashboard, path: "/client/dashboard" },
    ],
  },
  {
    title: "Services",
    items: [
      { label: "Request Service", icon: Briefcase, path: "/client/request-service" },
      { label: "Service Progress", icon: SquareChartGantt, path: "/client/service-progress" },
      { label: "Feedback", icon: ClipboardList, path: "/client/feedback" },
    ],
  },
  {
    title: "Financials",
    items: [
      { label: "Contracts", icon: FileSignature, path: "/client/contracts" },
      { label: "Invoices & Payments", icon: HandCoins, path: "/client/invoices-payments" },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Profile", icon: UserRound, path: "/client/profile" },
    ],
  },
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

  const isActive = (path: string, label: string) => {
    if (activeItem) {
      return label === activeItem;
    }
    return location.pathname === path;
  };

  return (
    <aside className="dashboard-sidebar client-sidebar">
      <div className="sidebar-brand">
        <Link to="/client/dashboard" className="brand-link">
          <img src="/logo2.png" alt="ServiceFlow CRM" className="sidebar-logo" />
        </Link>
      </div>

      <div className="sidebar-content">
        <nav className="sidebar-nav" aria-label="Client Navigation">
          {navSections.map((section) => (
            <div key={section.title} className="nav-section">
              <h3 className="section-title">{section.title}</h3>
              <div className="section-items">
                {section.items.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
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
