import { useAuth } from '../AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Routes that require access control
const RESTRICTED_ROUTES = [
  '/dashboard',
  '/dashboard/log-reaction',
  '/dashboard/history',
  '/dashboard/analysis'
];

export const useAccessControl = (checkAccess: boolean = true) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const isRestrictedRoute = RESTRICTED_ROUTES.includes(location.pathname);

  // Allow access to any authenticated user
  const hasAccess = !isRestrictedRoute || (user !== null);

  // Redirect if not authenticated (after loading)
  useEffect(() => {
    if (!loading && checkAccess && isRestrictedRoute) {
      if (!user) {
        navigate('/signin');
      }
    }
  }, [loading, checkAccess, isRestrictedRoute, hasAccess, user, navigate]);

  return {
    user,
    hasAccess,
    redirectIfNoAccess: () => {}, // not used anymore, kept for compatibility
    isRestrictedRoute,
    loading
  };
}; 
