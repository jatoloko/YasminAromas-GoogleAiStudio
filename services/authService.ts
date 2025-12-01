import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface User {
  id: string;
  username: string;
}

const SESSION_KEY = 'yasmin_user_session';

// Obter cliente Supabase
const getSupabaseClient = (): SupabaseClient | null => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Erro ao criar cliente Supabase:', error);
    return null;
  }
};

// Hash de senha usando Web Crypto API (nativo do browser)
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

// Verificar senha
const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
};

// Salvar sessão
const saveSession = (user: User): void => {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Erro ao salvar sessão:', error);
  }
};

// Obter sessão
const getSession = (): User | null => {
  try {
    const session = sessionStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch (error) {
    console.error('Erro ao obter sessão:', error);
    return null;
  }
};

// Limpar sessão
const clearSession = (): void => {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Erro ao limpar sessão:', error);
  }
};

export const AuthService = {
  // Registrar novo usuário
  async signUp(username: string, password: string): Promise<{ user: User | null; error: string | null }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { user: null, error: 'Supabase não configurado' };
    }

    if (!username || username.length < 3) {
      return { user: null, error: 'Username deve ter pelo menos 3 caracteres' };
    }

    if (!password || password.length < 6) {
      return { user: null, error: 'Senha deve ter pelo menos 6 caracteres' };
    }

    try {
      // Verificar se username já existe
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('username', username.toLowerCase().trim())
        .single();

      if (existingUser) {
        return { user: null, error: 'Username já está em uso' };
      }

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 é "not found", que é o que queremos
        return { user: null, error: checkError.message };
      }

      // Hash da senha
      const passwordHash = await hashPassword(password);

      // Criar usuário
      const { data, error } = await supabase
        .from('users')
        .insert({
          username: username.toLowerCase().trim(),
          password_hash: passwordHash,
        })
        .select()
        .single();

      if (error) {
        return { user: null, error: error.message };
      }

      const user: User = {
        id: data.id,
        username: data.username,
      };

      saveSession(user);
      return { user, error: null };
    } catch (error) {
      return { user: null, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Fazer login
  async signIn(username: string, password: string): Promise<{ user: User | null; error: string | null }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { user: null, error: 'Supabase não configurado' };
    }

    try {
      // Buscar usuário por username
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('id, username, password_hash')
        .eq('username', username.toLowerCase().trim())
        .single();

      if (fetchError || !userData) {
        return { user: null, error: 'Username ou senha incorretos' };
      }

      // Verificar senha
      const isValid = await verifyPassword(password, userData.password_hash);
      if (!isValid) {
        return { user: null, error: 'Username ou senha incorretos' };
      }

      const user: User = {
        id: userData.id,
        username: userData.username,
      };

      saveSession(user);
      return { user, error: null };
    } catch (error) {
      return { user: null, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Fazer logout
  async signOut(): Promise<{ error: string | null }> {
    clearSession();
    return { error: null };
  },

  // Obter usuário atual
  async getCurrentUser(): Promise<User | null> {
    const session = getSession();
    if (!session) {
      return null;
    }

    // Verificar se usuário ainda existe no banco
    const supabase = getSupabaseClient();
    if (!supabase) {
      return session; // Retornar sessão se Supabase não estiver configurado
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username')
        .eq('id', session.id)
        .single();

      if (error || !data) {
        clearSession();
        return null;
      }

      const user: User = {
        id: data.id,
        username: data.username,
      };

      // Atualizar sessão caso username tenha mudado
      saveSession(user);
      return user;
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      return session; // Retornar sessão em caso de erro
    }
  },

  // Escutar mudanças de autenticação (não usado com sessão customizada, mas mantido para compatibilidade)
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    // Verificar sessão periodicamente
    const checkSession = () => {
      const session = getSession();
      callback(session);
    };

    checkSession();
    const interval = setInterval(checkSession, 5000); // Verificar a cada 5 segundos

    return () => {
      clearInterval(interval);
    };
  },
};
