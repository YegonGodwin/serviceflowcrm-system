import { useLayoutEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import {
  Briefcase,
  ClipboardList,
  FileText,
  HandCoins,
  LayoutDashboard,
  LogOut,
  Settings,
  SquarePen,
  Users,
  UserSquare2,
  ChevronRight,
  X,
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
      { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Employees", icon: UserSquare2, path: "/admin/employees" },
      { label: "Clients", icon: Users, path: "/admin/clients" },
      { label: "Service Request", icon: Briefcase, path: "/admin/service-request" },
      { label: "Contracts", icon: SquarePen, path: "/admin/contracts" },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Finances", icon: HandCoins, path: "/admin/finances" },
      { label: "Feedback", icon: ClipboardList, path: "/admin/feedback" },
      { label: "Reports", icon: FileText, path: "/admin/reports" },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Settings", icon: Settings, path: "/admin/settings" },
    ],
  },
];

interface SidebarProps {
  onLogout?: () => void;
  activeItem?: string;
}

export default function Sidebar({ onLogout, activeItem }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const activeLinkRef = useRef<HTMLAnchorElement>(null);
  const { isOpen, close } = useSidebar();

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
    <>
      <div className={`sidebar-overlay ${isOpen ? "is-open" : ""}`} onClick={close} />
      <aside className={`dashboard-sidebar admin-sidebar ${isOpen ? "is-open" : ""}`}>
        <div className="sidebar-brand">
          <Link to="/admin/dashboard" className="brand-link">
            <img src="/logo2.png" alt="ServiceFlow CRM" className="sidebar-logo" />
          </Link>
          <button className="hamburger-btn" onClick={close} aria-label="Close Sidebar">
            <X size={24} color="white" />
          </button>
        </div>

        <div className="sidebar-content">
          <nav className="sidebar-nav" aria-label="Main Navigation">
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
    </>
  );
}
