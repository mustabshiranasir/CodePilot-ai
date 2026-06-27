import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { supabase } from '../lib/supabase';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role?: string, teamPasscode?: string, teamName?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    const { data: authUser } = await supabase.auth.getUser();
    if (authUser?.user) {
      return {
        id: authUser.user.id,
        email: authUser.user.email || '',
        name: authUser.user.user_metadata?.name as string || authUser.user.email?.split('@')[0] || 'Developer',
        avatar: '',
        role: 'Developer',
        teamId: undefined,
      };
    }
    return null;
  }

  return {
    id: data.id,
    email: data.email || '',
    name: data.name || data.email?.split('@')[0] || 'Developer',
    avatar: data.avatar || '',
    role: data.role || 'Developer',
    teamId: data.team_id,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const handleSession = useCallback(async (userId: string) => {
    const profile = await fetchProfile(userId);
    if (profile) {
      setUser(profile);
    } else {
      setUser({
        id: userId,
        email: '',
        name: 'Developer',
        role: 'Developer',
        teamId: undefined,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleSession(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        handleSession(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [handleSession]);

  function checkRateLimit(err: any) {
    if (err?.status === 429 || err?.message?.includes('429') || err?.code === '429') {
      throw new Error('Too many attempts. Please wait 60 seconds and try again.');
    }
  }

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      checkRateLimit(error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string, role?: string, teamPasscode?: string, teamName?: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          ...(role && { role }),
          ...(teamPasscode && { team_passcode: teamPasscode }),
          ...(teamName && { team_name: teamName }),
        },
      },
    });

    if (error) {
      setLoading(false);
      checkRateLimit(error);
      throw error;
    }

    if (data?.session?.user) {
      await handleSession(data.session.user.id);
    } else if (data?.user) {
      setLoading(false);
      throw new Error('Check your email for confirmation link, then sign in.');
    } else {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
