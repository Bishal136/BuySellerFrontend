import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

const ProtectedRoute = ({ children, allowedRoles = ['customer', 'seller', 'admin'] }) => {
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth);
  const location = useLocation();

  // Debug logs
  console.log('ProtectedRoute Debug:');
  console.log('- isAuthenticated:', isAuthenticated);
  console.log('- user:', user);
  console.log('- userRole:', user?.role);
  console.log('- allowedRoles:', allowedRoles);
  console.log('- isLoading:', isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    toast.error('Please login to access this page');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    toast.error(`Access denied. ${user?.role}s are not allowed to access this page.`);
    
    // Redirect based on role
    if (user?.role === 'seller') {
      return <Navigate to="/seller/dashboard" replace />;
    } else if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;