import React from 'react';
import { useAdminAuth } from '../../services/adminAuth';
import { useFirestoreProducts } from '../../services/firestoreMenu';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { Loader2 } from 'lucide-react';

interface AdminPageProps {
  onNavigateHome: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigateHome }) => {
  const {
    user,
    isAdmin,
    loading: authLoading,
    checkingRole,
    error: authError,
    login,
    logout,
    clearError,
  } = useAdminAuth();

  const { products, loading: productsLoading } = useFirestoreProducts();

  // If currently initializing authentication state
  if (authLoading && !user) {
    return (
      <div className="min-h-screen bg-[#fcfbf9] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-[#a83b24] animate-spin mb-3" />
        <p className="text-sm font-semibold text-stone-700">Verificando sesión administrativa...</p>
        <p className="text-xs text-stone-400 mt-1">Delicias Belgi</p>
      </div>
    );
  }

  // If user is authenticated AND verified as admin in Firestore 'admins/{uid}'
  if (user && isAdmin) {
    return (
      <AdminDashboard
        userEmail={user.email}
        products={products}
        loadingProducts={productsLoading}
        onLogout={logout}
        onNavigateToPublicMenu={onNavigateHome}
      />
    );
  }

  // Otherwise, display the Login screen
  return (
    <AdminLogin
      onLogin={login}
      loading={authLoading}
      checkingRole={checkingRole}
      error={authError}
      onClearError={clearError}
      onNavigateHome={onNavigateHome}
    />
  );
};
