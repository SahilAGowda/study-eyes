import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { hasRoleAccess } from '../../routes';

const PrivateRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  console.log('PrivateRoute - isAuthenticated:', isAuthenticated);
  console.log('PrivateRoute - user:', user);
  console.log('PrivateRoute - user.role:', user?.role);
  console.log('PrivateRoute - requiredRole:', requiredRole);
  console.log('PrivateRoute - location:', location.pathname);

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if a specific role is required
  if (requiredRole && !hasRoleAccess(user?.role, requiredRole)) {
    console.log('❌ Role access denied! User role:', user?.role, 'Required role:', requiredRole);
    // Redirect to user's appropriate dashboard if they don't have access
    const userRole = user?.role?.toLowerCase() || 'student';
    console.log('Redirecting to:', `/${userRole}/dashboard`);
    return <Navigate to={`/${userRole}/dashboard`} replace />;
  }

  console.log('✅ Access granted!');
  return children;
};

export default PrivateRoute;