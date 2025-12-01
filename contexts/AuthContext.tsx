import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthService, User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (username: string, email: string, password: string) => Promise<{ error: string | null; message?: string }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar usuário atual ao montar
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Escutar mudanças de autenticação
    const unsubscribe = AuthService.onAuthStateChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (username: string, email: string, password: string) => {
    const { user: newUser, error, message } = await AuthService.signUp(username, email, password);
    if (!error && newUser) {
      setUser(newUser);
    }
    return { error, message };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { user: signedInUser, error } = await AuthService.signIn(email, password);
    if (!error && signedInUser) {
      setUser(signedInUser);
    }
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await AuthService.signOut();
    if (!error) {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

