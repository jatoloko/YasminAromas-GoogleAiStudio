import { SupabaseClient, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabaseService';

export interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthResponse {
  user: User | null;
  error: string | null;
  message?: string;
}

const mapSupabaseUser = (supabaseUser: SupabaseAuthUser | null): User | null => {
  if (!supabaseUser) {
    return null;
  }

  const metadataUsername = typeof supabaseUser.user_metadata?.username === 'string'
    ? supabaseUser.user_metadata.username
    : null;

  const fallbackUsername = supabaseUser.email?.split('@')[0] || 'Usuário';

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    username: metadataUsername || fallbackUsername,
  };
};

const ensureSupabaseClient = (): SupabaseClient | null => getSupabaseClient();

export const AuthService = {
  async signUp(username: string, email: string, password: string): Promise<AuthResponse> {
    const supabase = ensureSupabaseClient();
    if (!supabase) {
      return { user: null, error: 'Supabase não configurado' };
    }

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedUsername = username.trim();

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: { username: normalizedUsername },
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      const mappedUser = mapSupabaseUser(data.user);

      if (!data.session) {
        return {
          user: mappedUser,
          error: null,
          message: 'Conta criada! Verifique seu e-mail para confirmar o cadastro.',
        };
      }

      return { user: mappedUser, error: null };
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return { user: null, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const supabase = ensureSupabaseClient();
    if (!supabase) {
      return { user: null, error: 'Supabase não configurado' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      return { user: mapSupabaseUser(data.user), error: null };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return { user: null, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  async signOut(): Promise<{ error: string | null }> {
    const supabase = ensureSupabaseClient();
    if (!supabase) {
      return { error: 'Supabase não configurado' };
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro ao sair:', error);
      return { error: error.message };
    }

    return { error: null };
  },

  async getCurrentUser(): Promise<User | null> {
    const supabase = ensureSupabaseClient();
    if (!supabase) {
      return null;
    }

    try {
      const { data } = await supabase.auth.getSession();
      return mapSupabaseUser(data.session?.user ?? null);
    } catch (error) {
      console.error('Erro ao recuperar usuário atual:', error);
      return null;
    }
  },

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    const supabase = ensureSupabaseClient();
    if (!supabase) {
      callback(null);
      return () => {};
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(mapSupabaseUser(session?.user ?? null));
    });

    return () => {
      subscription.unsubscribe();
    };
  },
};
