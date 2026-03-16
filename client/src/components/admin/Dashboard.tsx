import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import DashboardHeader from "./DashboardHeader";
import ProfileCard from "./ProfileCard";
import PendingRequests from "./PendingRequests";

interface DashboardProps {
  onLogout?: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  return (
    <main className="dashboard-page">
      <Sidebar onLogout={onLogout} activeItem="Dashboard" />

      <section className="dashboard-main">
        <Topbar title="Dashboard" />

        <div className="dashboard-content">
          <DashboardHeader />

          <div className="content-grid">
            <ProfileCard />
            <PendingRequests />
          </div>
        </div>
      </section>
    </main>
  );
}
