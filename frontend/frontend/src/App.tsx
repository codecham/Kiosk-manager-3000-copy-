import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import LoginPage from '@/pages/LoginPage/LoginPage';
import DashboardPage from '@/pages/DashboardPage/DashboardPage';
import TerminalsPage from '@/pages/TerminalsPage/TerminalsPage';
import TerminalDetailPage from '@/pages/TerminalDetailPage/TerminalDetailPage';
import GroupsPage from '@/pages/GroupsPage/GroupsPage';
import PlaybooksPage from '@/pages/PlaybooksPage/PlaybooksPage';
import ComponentsPage from '@/pages/ComponentsPage/ComponentsPage';

const isAuthenticated = () => !!localStorage.getItem('token');

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) =>
  isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="terminals" element={<TerminalsPage />} />
        <Route path="terminals/:id" element={<TerminalDetailPage />} />
        <Route path="groups" element={<GroupsPage />} />
        <Route path="playbooks" element={<PlaybooksPage />} />
        <Route path="components" element={<ComponentsPage />} />
      </Route>
    </Routes>
  );
}
