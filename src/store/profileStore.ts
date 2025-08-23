import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";
import { AuthError } from "@supabase/supabase-js";

interface ProfileStore {
  loading: boolean;
  openAiApiKey: string | null;
  prompts: string[];
  profile: Profile | null;

  loadProfile: (userId: string) => void;
  fetchApiKey: () => Promise<{ data: string; error: AuthError | null }>;
  updateProfile: (
    userId: string,
    { apiKey, prompts }: { apiKey?: string; prompts?: string[] },
  ) => void;

  _upsertProfile: (updateData: {
    user_id: string;
    openai_api_key_id: string | null;
    prompts: string[];
    updated_at: string;
  }) => Promise<{ data: Profile; error: AuthError | null }>;

  _upsertApiKey: (
    openai_api_key: string,
  ) => Promise<{ apiKeyId: string; error: AuthError | null }>;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  loading: false,
  openAiApiKey: null,
  prompts: [],
  profile: null,

  async loadProfile(userId: string) {
    try {
      if (!userId) throw new AuthError("No user id");

      set({ loading: true });

      const { data, error } = (await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)) as {
        data: Profile[] | null;
        error: AuthError | null;
      };

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw error;
      }

      const profileData = data?.[0] as Profile | undefined;

      // Set Api key
      if (profileData?.openai_api_key_id) {
        try {
          const { data: openAiApiKey, error } = await get().fetchApiKey();

          if (error) throw error;

          set({ openAiApiKey });
        } catch (error) {
          throw error;
        }
      }

      // Set prompts
      if (profileData?.prompts?.length) {
        set({ prompts: profileData.prompts });
      }

      // Set entire profile
      if (profileData) {
        set({ profile: profileData });
      }
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  async fetchApiKey() {
    const { data, error } = (await supabase.rpc("get_user_openai_api_key")) as {
      data: string;
      error: AuthError | null;
    };

    return { data, error };
  },

  async updateProfile(
    userId: string,
    { apiKey, prompts }: { apiKey?: string; prompts?: string[] },
  ) {
    try {
      if (!userId) throw new AuthError("No user id");

      set({ loading: true });

      const updatedData = {
        user_id: userId,
        openai_api_key_id: "",
        prompts: prompts ?? [],
        updated_at: new Date().toISOString(),
      };

      if (apiKey) {
        const { apiKeyId, error } = await get()._upsertApiKey(apiKey);

        if (error) throw error;

        set({ openAiApiKey: apiKey });
        updatedData.openai_api_key_id = apiKeyId;
      }

      if (prompts) {
        set({ prompts: updatedData.prompts });
        updatedData.prompts = prompts;
      }

      const { data, error } = await get()._upsertProfile(updatedData);

      if (error) throw error;

      if (data) {
        set({ profile: data });
      }
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Helper method to update profile in database
  _upsertProfile: async (updateData: {
    user_id: string;
    openai_api_key_id: string | null;
    prompts: string[];
    updated_at: string;
  }) => {
    const { data, error } = (await supabase
      .from("profiles")
      .upsert(updateData, { onConflict: "user_id" })
      .select()
      .single()) as { data: Profile; error: AuthError | null };

    return { data, error };
  },

  // Upsert API key separately in the Vault and return the key id
  async _upsertApiKey(openai_api_key: string) {
    const { data: apiKeyId, error } = (await supabase.rpc(
      "upsert_user_openai_api_key",
      { new_openai_api_key: openai_api_key },
    )) as { data: string; error: AuthError | null };

    return { apiKeyId, error };
  },
}));
