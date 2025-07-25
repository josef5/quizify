import { DARK_MODE_LOCAL_STORAGE_KEY } from "@/lib/constants";
import { encryptSync } from "@/lib/encryption";
import { create } from "zustand";

interface Store {
  isSettingsOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
  toggleIsSettingsOpen: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
  encryptedApiKey: string;
  encryptAndSetApiKey: (key: string) => void;
  encryptAndSaveApiKey: (key: string) => void;
}

export const useStore = create<Store>((set) => ({
  isSettingsOpen: false,
  setIsSettingsOpen: (isOpen: boolean) => set({ isSettingsOpen: isOpen }),
  toggleIsSettingsOpen: () =>
    set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),

  isDarkMode:
    localStorage.getItem(DARK_MODE_LOCAL_STORAGE_KEY) === "dark" || false,
  toggleDarkMode: () =>
    set((state) => {
      const newMode = !state.isDarkMode;

      localStorage.setItem(
        DARK_MODE_LOCAL_STORAGE_KEY,
        newMode ? "dark" : "light",
      );

      return { isDarkMode: newMode };
    }),
  setDarkMode: (value: boolean) => {
    localStorage.setItem("mode", value ? "dark" : "light");
    set({ isDarkMode: value });
  },

  encryptedApiKey: localStorage.getItem("apiKey") ?? "",
  encryptAndSetApiKey: (key: string) => {
    const encryptedApiKey = encryptSync(key);
    set({ encryptedApiKey });
  },
  encryptAndSaveApiKey: (key: string) => {
    const encryptedApiKey = encryptSync(key);

    localStorage.setItem("apiKey", encryptedApiKey);
    set({ encryptedApiKey });
  },
}));
