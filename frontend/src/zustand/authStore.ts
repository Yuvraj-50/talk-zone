import { User } from "@/types";
import { create } from "zustand";

type AuthState = {
  user: User | null;
  authenticated: boolean;
  loading: boolean;
};

type AuthAction = {
  updateAuth: (auth: Partial<AuthState>) => void;
  setLoading: (val: boolean) => void;
  setUser: (user: User | null) => void;
  setAuthenticated: (val: boolean) => void;
  resetState: () => void;
};

const initialState: AuthState = {
  user: null,
  loading: false,
  authenticated: false,
};

export const useAuthStore = create<AuthState & AuthAction>()((set) => ({
  ...initialState,

  updateAuth: (auth: Partial<AuthState>) =>
    set((state) => ({ ...state, ...auth })),

  setLoading: (val: boolean) => set((state) => ({ ...state, loading: val })),

  setUser: (user: User | null) => set((state) => ({ ...state, user })),

  setAuthenticated: (val: boolean) =>
    set((state) => ({ ...state, authenticated: val })),

  resetState: () => set(initialState),
}));
