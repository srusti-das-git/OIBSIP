import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// role = 'user' or 'admin'
const ProtectedRoute = ({ role, children }) => {
  const { user, admin } = useAuth();
  if (role === 'admin' && !admin) return <Navigate to="/admin/login" replace />;
  if (role === 'user' && !user) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
