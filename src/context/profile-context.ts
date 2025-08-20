import { createContext } from "react";
import type { ProfileContextType } from "./profile-provider";

export const ProfileContext = createContext<ProfileContextType | undefined>(
  undefined,
);
