import { create } from 'zustand';
import { supabase } from "@/integrations/supabase/client";

type UserRole = "job_seeker" | "employer" | "admin" | null;

interface AuthState {
  role: UserRole;
  loading: boolean;
  checkUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  role: null,
  loading: true,
  checkUser: async () => {
    try {
      const { data } = await supabase.auth.getUser();
      set({ 
        role: data.user ? (data.user.user_metadata.role as UserRole) : null,
        loading: false 
      });
    } catch (error) {
      console.error("Error checking user:", error);
      set({ role: null, loading: false });
    }
  },
  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({ role: null });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  },
}));