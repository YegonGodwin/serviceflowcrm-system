import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./components/admin/Dashboard";
import Employees from "./components/admin/Employees";
import Clients from "./components/admin/Clients";
import ServiceRequest from "./components/admin/ServiceRequest";
import Contracts from "./components/admin/Contracts";
import Finances from "./components/admin/Finances";
import Feedback from "./components/admin/Feedback";
import Reports from "./components/admin/Reports";
import Settings from "./components/admin/Settings";
import ClientDashboard from "./components/client/ClientDashboard";
import ClientRequestService from "./components/client/ClientRequestService";
import ClientServiceProgress from "./components/client/ClientServiceProgress";
import ClientContracts from "./components/client/ClientContracts";
import ClientInvoicesPayments from "./components/client/ClientInvoicesPayments";
import ClientFeedback from "./components/client/ClientFeedback";
import ClientProfile from "./components/client/ClientProfile";
import LoginPage from "./components/LoginPage";
import EmployeeDashboard from "./components/employee/EmployeeDashboard";
import EmployeeTasks from "./components/employee/EmployeeTasks";
import EmployeeSchedule from "./components/employee/EmployeeSchedule";
import EmployeeHistory from "./components/employee/EmployeeHistory";
import EmployeeProfile from "./components/employee/EmployeeProfile";
import EmployeeEarnings from "./components/employee/EmployeeEarnings";
import { AuthProvider, useAuth } from "./context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
};

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="employees" element={<Employees />} />
              <Route path="clients" element={<Clients />} />
              <Route path="service-request" element={<ServiceRequest />} />
              <Route path="contracts" element={<Contracts />} />
              <Route path="finances" element={<Finances />} />
              <Route path="feedback" element={<Feedback />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </ProtectedRoute>
        } />

        {/* Client Routes */}
        <Route path="/client/*" element={
          <ProtectedRoute allowedRoles={['client']}>
            <Routes>
              <Route path="dashboard" element={<ClientDashboard />} />
              <Route path="request-service" element={<ClientRequestService />} />
              <Route path="service-progress" element={<ClientServiceProgress />} />
              <Route path="contracts" element={<ClientContracts />} />
              <Route path="invoices-payments" element={<ClientInvoicesPayments />} />
              <Route path="feedback" element={<ClientFeedback />} />
              <Route path="profile" element={<ClientProfile />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </ProtectedRoute>
        } />

        {/* Employee Routes */}
        <Route path="/employee/*" element={
          <ProtectedRoute allowedRoles={['employee']}>
            <Routes>
              <Route path="dashboard" element={<EmployeeDashboard />} />
              <Route path="tasks" element={<EmployeeTasks />} />
              <Route path="schedule" element={<EmployeeSchedule />} />
              <Route path="history" element={<EmployeeHistory />} />
              <Route path="profile" element={<EmployeeProfile />} />
              <Route path="earnings" element={<EmployeeEarnings />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </ProtectedRoute>
        } />

        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
};

const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}/dashboard`} replace />;
};

export default App;
