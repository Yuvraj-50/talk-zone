import { User } from "@/types";
import { create } from "zustand";

type AuthState = {
  user: User | null;
  authenticated: boolean;
};

type AuthAction = {
  updateAuth: (auth: AuthState) => void;
};

export const useAuthStore = create<AuthState & AuthAction>()((set) => ({
  user: null,
  authenticated: false,
  updateAuth: (auth) =>
    set({ user: auth.user, authenticated: auth.authenticated }),
}));
