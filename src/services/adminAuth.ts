import { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase.js';

export interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  checkingRole: boolean;
  error: string | null;
}

export function useAdminAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [checkingRole, setCheckingRole] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check admin privileges in Firestore in collection 'admin' with rol: 'admin'
  const verifyAdminRole = useCallback(async (firebaseUser: User): Promise<boolean> => {
    setCheckingRole(true);
    try {
      // 1. Check primary 'admin/{uid}' document
      const adminDocRef = doc(db, 'admin', firebaseUser.uid);
      const adminDocSnap = await getDoc(adminDocRef);

      let hasAdminPrivilege = false;

      if (adminDocSnap.exists()) {
        const data = adminDocSnap.data();
        // Check that rol is "admin"
        if (data?.rol === 'admin') {
          hasAdminPrivilege = true;
        }
      } else {
        // Fallback check in 'admins/{uid}' for backwards compatibility
        const legacyDocRef = doc(db, 'admins', firebaseUser.uid);
        const legacyDocSnap = await getDoc(legacyDocRef);
        if (legacyDocSnap.exists()) {
          const legacyData = legacyDocSnap.data();
          if (!legacyData?.rol || legacyData.rol === 'admin') {
            hasAdminPrivilege = true;
          }
        }
      }

      if (hasAdminPrivilege) {
        setIsAdmin(true);
        setError(null);
        setCheckingRole(false);
        return true;
      } else {
        // User is authenticated in Firebase Auth, but does not have admin role in Firestore
        setIsAdmin(false);
        setError('Permisos insuficientes: el usuario no tiene rol de administrador.');
        await signOut(auth);
        setUser(null);
        setCheckingRole(false);
        return false;
      }
    } catch (err: any) {
      console.error('Error verifying admin document:', err);
      setIsAdmin(false);
      setError(err?.message || 'Error al comprobar permisos de administrador.');
      await signOut(auth);
      setUser(null);
      setCheckingRole(false);
      return false;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await verifyAdminRole(currentUser);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [verifyAdminRole]);

  // Login handler
  const login = async (email: string, pass: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const authenticatedUser = userCredential.user;
      setUser(authenticatedUser);

      // Verify in Firestore admins/{uid}
      const hasAdminRole = await verifyAdminRole(authenticatedUser);
      setLoading(false);
      return hasAdminRole;
    } catch (err: any) {
      console.error('Login error:', err);
      let friendlyMessage = 'Error al iniciar sesión. Verifica tus credenciales.';
      if (
        err.code === 'auth/invalid-credential' || 
        err.code === 'auth/invalid-login-credentials' ||
        err.code === 'auth/wrong-password' || 
        err.code === 'auth/user-not-found'
      ) {
        friendlyMessage = 'Credenciales incorrectas: correo o contraseña incorrectos.';
      } else if (err.code === 'auth/user-disabled') {
        friendlyMessage = 'Esta cuenta de usuario ha sido deshabilitada.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyMessage = 'El formato del correo electrónico no es válido.';
      } else if (err.code === 'auth/too-many-requests') {
        friendlyMessage = 'Demasiados intentos fallidos. Intenta más tarde.';
      } else if (err.message) {
        friendlyMessage = err.message;
      }
      setError(friendlyMessage);
      setIsAdmin(false);
      setUser(null);
      setLoading(false);
      return false;
    }
  };

  // Logout handler
  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
      setError(null);
    } catch (err: any) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isAdmin,
    loading,
    checkingRole,
    error,
    login,
    logout,
    clearError: () => setError(null),
  };
}
