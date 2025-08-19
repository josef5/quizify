import { createContext } from "react";
import type { Profile } from "@/types";
import type { AuthError } from "@supabase/supabase-js";

export interface UpdateProfileResponse {
  error: AuthError | null;
}

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  updateProfile: (
    openai_api_key: string,
    prompts: string[],
  ) => Promise<UpdateProfileResponse>;
  getOpenAIApiKey: () => Promise<string | null>;
  refetch: () => Promise<void>;
}

export const ProfileContext = createContext<ProfileContextType | undefined>(
  undefined,
);
