import { create } from "zustand";

type UpdateAuth = {
  userName: string;
  email: string;
  userId: number;
};

type AuthState = {
  userName: string;
  email: string;
  userId: number | null;
  updateAuth: (auth: UpdateAuth) => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  userName: "",
  email: "",
  userId: null,
  updateAuth: (auth: UpdateAuth) =>
    set({ userName: auth.userName, email: auth.email, userId: auth.userId }),
}));
