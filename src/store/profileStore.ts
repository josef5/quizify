import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";
import { AuthError } from "@supabase/supabase-js";

interface ProfileStore {
  loading: boolean;
  apiKey: string;
  prompts: string[];
  profile: Profile | null;

  loadProfile: (userId: string) => Promise<void>;
  fetchApiKey: () => Promise<{ data: string; error: AuthError | null }>;
  updateProfile: (
    userId: string,
    { apiKey, prompts }: { apiKey?: string; prompts?: string[] },
  ) => Promise<void>;
  clearProfile: () => void;

  _upsertProfile: (updateData: {
    user_id: string;
    api_key_id?: string | null;
    prompts?: string[] | null;
    updated_at: string;
  }) => Promise<{ data: Profile; error: AuthError | null }>;

  _upsertApiKey: (
    apiKey: string,
  ) => Promise<{ apiKeyId: string; error: AuthError | null }>;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  loading: false,
  apiKey: "",
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
      if (profileData?.api_key_id) {
        try {
          const { data: apiKey, error } = await get().fetchApiKey();

          if (error) throw error;

          set({ apiKey });
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
    const { data, error } = (await supabase.rpc("get_user_api_key")) as {
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

      const updatedData: Partial<Profile> = {
        user_id: userId,
        updated_at: new Date().toISOString(),
      };

      if (apiKey) {
        // Upsert API key and get the key id
        const { apiKeyId, error } = await get()._upsertApiKey(apiKey);

        if (error) throw error;

        set({ apiKey });
        updatedData.api_key_id = apiKeyId;
      }

      if (prompts) {
        set({ prompts });
        updatedData.prompts = prompts;
      }

      const { data, error } = await get()._upsertProfile(
        updatedData as Profile,
      );

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

  // Called when user signs out
  clearProfile() {
    set({
      loading: false,
      apiKey: "",
      prompts: [],
      profile: null,
    });
  },

  // Helper method to update profile in database
  _upsertProfile: async (updateData: Partial<Profile>) => {
    const { data, error } = (await supabase
      .from("profiles")
      .upsert(updateData, { onConflict: "user_id" })
      .select()
      .single()) as { data: Profile; error: AuthError | null };

    return { data, error };
  },

  // Upsert API key separately in the Vault and return the key id
  async _upsertApiKey(apiKey: string) {
    const { data: apiKeyId, error } = (await supabase.rpc(
      "upsert_user_api_key",
      { new_api_key: apiKey },
    )) as { data: string; error: AuthError | null };

    return { apiKeyId, error };
  },
}));
