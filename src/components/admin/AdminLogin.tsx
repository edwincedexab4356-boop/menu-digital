import React, { useState } from 'react';
import { Lock, Mail, ArrowLeft, ShieldAlert, Loader2, KeyRound } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (email: string, pass: string) => Promise<boolean>;
  loading: boolean;
  checkingRole: boolean;
  error: string | null;
  onClearError: () => void;
  onNavigateHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLogin,
  loading,
  checkingRole,
  error,
  onClearError,
  onNavigateHome,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setIsSubmitting(true);
    await onLogin(email, password);
    setIsSubmitting(false);
  };

  const isBusy = loading || checkingRole || isSubmitting;

  return (
    <div className="min-h-screen bg-[#fcfbf9] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#a83b24] selection:text-white">
      {/* Back to Public Menu Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-[#a83b24] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Volver al Menú Público
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Brand Card Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-[#1c1917] rounded-sm flex items-center justify-center mx-auto mb-3 shadow-sm border border-stone-800">
            <Lock className="w-6 h-6 text-[#d97706]" />
          </div>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Panel de Administración
          </h1>
          <p className="mt-1 text-sm text-[#a83b24] font-semibold tracking-wider uppercase">
            Delicias Belgi
          </p>
          <p className="mt-1 text-xs text-stone-500">
            Ingresa tus credenciales de administrador para gestionar la carta
          </p>
        </div>

        {/* Login Form Container */}
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-stone-200 rounded-sm">
          {error && (
            <div className="mb-6 p-3.5 rounded-xs bg-red-50 border border-red-200 text-red-800 flex items-start space-x-3 text-xs">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{error}</p>
                {error.includes('permisos') && (
                  <p className="mt-1 text-[11px] text-red-600">
                    Tu usuario debe estar registrado en la colección <code className="bg-red-100 px-1 py-0.5 rounded font-mono">admin/&#123;UID&#125;</code> con <code className="bg-red-100 px-1 py-0.5 rounded font-mono">rol: "admin"</code> en Firestore.
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label 
                htmlFor="admin-email" 
                className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) onClearError();
                  }}
                  placeholder="admin@deliciasbelgi.com"
                  disabled={isBusy}
                  className="block w-full pl-9 pr-3 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xs text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#a83b24] focus:border-[#a83b24] transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="admin-password" 
                className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) onClearError();
                  }}
                  placeholder="••••••••••••"
                  disabled={isBusy}
                  className="block w-full pl-9 pr-3 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xs text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#a83b24] focus:border-[#a83b24] transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                id="admin-login-submit"
                type="submit"
                disabled={isBusy || !email.trim() || !password}
                className="w-full flex items-center justify-center py-3 px-4 rounded-xs text-xs font-semibold uppercase tracking-widest text-white bg-[#a83b24] hover:bg-[#91321d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a83b24] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-xs active:scale-[0.99]"
              >
                {isBusy ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>
                      {checkingRole ? 'Comprobando rol de administrador...' : 'Iniciando sesión...'}
                    </span>
                  </>
                ) : (
                  <span>Iniciar sesión</span>
                )}
              </button>
            </div>
          </form>

          {/* Security Note */}
          <div className="mt-6 pt-5 border-t border-stone-200 text-center">
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Área restringida para administradores autorizados. El acceso requiere autenticación y verificación de rol en Cloud Firestore.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
