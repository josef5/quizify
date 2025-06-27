import { encrypt } from "@/lib/encryption";
import { create } from "zustand";

interface Store {
  isSettingsOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
  toggleIsSettingsOpen: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
  encryptedApiKey: string;
  encryptAndSetApiKey: (key: string) => Promise<void>;
}

export const useStore = create<Store>((set) => ({
  isSettingsOpen: false,
  setIsSettingsOpen: (isOpen: boolean) => set({ isSettingsOpen: isOpen }),
  toggleIsSettingsOpen: () =>
    set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),

  isDarkMode: true,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  setDarkMode: (value: boolean) => set({ isDarkMode: value }),

  encryptedApiKey: localStorage.getItem("apiKey") ?? "",
  encryptAndSetApiKey: async (key: string) => {
    const encryptedApiKey = await encrypt(key);

    localStorage.setItem("apiKey", encryptedApiKey);
    set({ encryptedApiKey });
  },
}));
