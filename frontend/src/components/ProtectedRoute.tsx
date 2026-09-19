import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { Loader2 } from 'lucide-react';
import { useAuth as useAppAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user, loading } = useAppAuth();
  const location = useLocation();

  if (!isLoaded || (isSignedIn && loading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  if (user && !user.onboarding_completed && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
