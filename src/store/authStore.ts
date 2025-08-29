import { create } from "zustand";
import type { Subscription, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthStore {
  loading: boolean;
  initialized: boolean;
  user: User | null;

  initialize: () => Promise<Subscription | void>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  clearUser: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,

  async initialize() {
    const state = get();
    if (state.initialized) return;

    // Get initial session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    set({
      user: session?.user ?? null,
      loading: false,
      initialized: true,
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        user: session?.user ?? null,
        loading: false,
      });
    });

    return subscription;
  },

  async signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  },

  async signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Clear user and remove auth token from local storage (forcibly log out)
  clearUser() {
    const localStorageKey = `sb-${import.meta.env.VITE_SUPABASE_URL.split("://")[1].split(".")[0]}-auth-token`;

    localStorage.removeItem(localStorageKey);

    set({ user: null });
  },
}));
