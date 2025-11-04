import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type UserRole = Database['public']['Tables']['users']['Row']['role'];

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  manager_id: string | null;
}

export const authService = {
  async signUp(email: string, password: string, name: string, role: UserRole = 'STAFF', managerId?: string) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user');

    const { error: profileError } = await supabase.from('users').insert([{
      id: authData.user.id,
      name,
      email,
      role,
      manager_id: managerId || null,
    }] as any);

    if (profileError) throw profileError;

    return authData.user;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;
    if (!profile) return null;

    const profileData = profile as any;
    return {
      id: profileData.id,
      email: profileData.email,
      name: profileData.name,
      role: profileData.role,
      manager_id: profileData.manager_id,
    };
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          const user = await this.getCurrentUser();
          callback(user);
        } else {
          callback(null);
        }
      })();
    });
  },
};
