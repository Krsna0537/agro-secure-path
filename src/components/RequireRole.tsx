import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const RequireRole = ({ role: requiredRole, children }: { role: string; children: React.ReactNode }) => {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!role || role !== requiredRole) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export default RequireRole;


