import { useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from '../utils/firebase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      if (!auth || !googleProvider) throw new Error('Firebase Auth is not configured.');
      const res = await signInWithPopup(auth, googleProvider);
      return res.user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const loginWithEmail = async (email, password) => {
    setAuthError(null);
    try {
      if (!auth) throw new Error('Firebase Auth is not configured.');
      const res = await signInWithEmailAndPassword(auth, email, password);
      return res.user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const signupWithEmail = async (email, password) => {
    setAuthError(null);
    try {
      if (!auth) throw new Error('Firebase Auth is not configured.');
      const res = await createUserWithEmailAndPassword(auth, email, password);
      return res.user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      if (auth) await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  return {
    user,
    loading,
    authError,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    logout,
    isAuthenticated: !!user
  };
}
