import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface ProtectedRouteProps {
  requiredRole?: string;
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // 1. JWT YOXDURSA: Adamı Auth səhifəsinə qov, amma getmək istədiyi linki (location) yadda saxla
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // 2. ROL UYĞUN DEYİLSƏ: Məsələn, CUSTOMER "/admin" səhifəsinə girməyə çalışırsa
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />; // Onu birbaşa Ana Səhifəyə qaytar
  }

  // 3. HƏR ŞEY QAYDASINDADIRSA: İçəri burax
  return <Outlet />; 
}