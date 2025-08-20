import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ProfileContext } from "./profile-context";
import { AuthError } from "@supabase/supabase-js";

interface UpdateProfileResponse {
  error: AuthError | null;
}

export interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  updateProfile: (
    openai_api_key: string,
    prompts: string[],
  ) => Promise<UpdateProfileResponse>;
  getOpenAIApiKey: () => Promise<string | null>;
  refetch: () => Promise<void>;
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw error;
      }

      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const updateProfile = async (openai_api_key: string, prompts: string[]) => {
    if (!user?.id)
      return {
        error: new Error("No user ID"),
      } as UpdateProfileResponse;

    try {
      let openai_api_key_id = profile?.openai_api_key_id || null;

      // Handle OpenAI API key if provided
      if (openai_api_key && openai_api_key.trim()) {
        const { data: secretData, error: secretError } = await supabase.rpc(
          "upsert_user_openai_api_key",
          { new_openai_api_key: openai_api_key },
        );

        if (secretError) throw secretError;
        openai_api_key_id = secretData;
      }

      // Update or insert profile with explicit conflict resolution
      const { data, error } = await supabase
        .from("profiles")
        .upsert(
          {
            user_id: user.id,
            openai_api_key_id,
            prompts,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id", // Specify the unique constraint column
          },
        )
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      return { error: null };
    } catch (error) {
      return { error } as UpdateProfileResponse;
    }
  };

  const getOpenAIApiKey = async () => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase.rpc("get_user_openai_api_key");

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error getting OpenAI API key:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!user?.id) {
      setProfile(null);
      setLoading(false);
      return;
    }

    fetchProfile();
  }, [user?.id, fetchProfile]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        updateProfile,
        getOpenAIApiKey,
        refetch: fetchProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}
