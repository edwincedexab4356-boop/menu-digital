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
        setError(`Permisos insuficientes: El usuario (${firebaseUser.email || firebaseUser.uid}) no tiene rol de administrador. Verifica que exista el documento "admin/${firebaseUser.uid}" con el campo rol: "admin" en Cloud Firestore.`);
        await signOut(auth);
        setUser(null);
        setCheckingRole(false);
        return false;
      }
    } catch (err: any) {
      console.error('Error verifying admin document:', err);
      setIsAdmin(false);
      const code = err?.code ? ` (${err.code})` : '';
      setError(`Error al consultar Firestore en "admin/${firebaseUser.uid}"${code}: ${err?.message || 'Error de permisos o conexión.'}`);
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
      // Extract the real Firebase error code and message
      const errorCode = err.code || 'unknown-error';
      const rawMessage = err.message || '';
      
      let friendlyMessage = `Error de Firebase (${errorCode}): ${rawMessage}`;
      
      if (
        errorCode === 'auth/invalid-credential' || 
        errorCode === 'auth/invalid-login-credentials' ||
        errorCode === 'auth/wrong-password' || 
        errorCode === 'auth/user-not-found'
      ) {
        friendlyMessage = `Credenciales incorrectas (${errorCode}): Verifica que el correo y la contraseña coincidan exactamente con el usuario registrado en Firebase Auth.`;
      } else if (errorCode === 'auth/user-disabled') {
        friendlyMessage = `Usuario deshabilitado (${errorCode}): La cuenta de este administrador ha sido suspendida en la consola de Firebase.`;
      } else if (errorCode === 'auth/invalid-email') {
        friendlyMessage = `Correo no válido (${errorCode}): El formato del correo electrónico ingresado no es válido.`;
      } else if (errorCode === 'auth/too-many-requests') {
        friendlyMessage = `Bloqueo temporal (${errorCode}): Demasiados intentos fallidos consecutivos. Espera unos minutos antes de reintentar.`;
      } else if (errorCode === 'auth/network-request-failed') {
        friendlyMessage = `Error de red (${errorCode}): No se pudo establecer conexión con Firebase. Verifica tu conexión a internet.`;
      } else if (errorCode === 'auth/operation-not-allowed') {
        friendlyMessage = `Proveedor no habilitado (${errorCode}): El método Email/Password no está habilitado en Firebase Authentication (Authentication > Sign-in method).`;
      } else if (errorCode === 'auth/unauthorized-domain') {
        friendlyMessage = `Dominio no autorizado (${errorCode}): El dominio de esta aplicación no está en la lista de dominios autorizados en Firebase Authentication.`;
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
