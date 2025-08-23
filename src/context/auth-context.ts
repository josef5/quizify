import type { User, AuthError } from "@supabase/supabase-js";
import { createContext } from "react";

interface AuthResponse {
  error: AuthError | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<AuthResponse>;
  clearUser: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
