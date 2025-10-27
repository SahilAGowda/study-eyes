import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { hasRoleAccess } from '../../routes';

const PrivateRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if a specific role is required
  if (requiredRole && !hasRoleAccess(user?.role, requiredRole)) {
    // Redirect to user's appropriate dashboard if they don't have access
    const userRole = user?.role?.toLowerCase() || 'student';
    return <Navigate to={`/${userRole}/dashboard`} replace />;
  }

  return children;
};

export default PrivateRoute;