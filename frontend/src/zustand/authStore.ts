import { create } from "zustand";
import { User } from "../types";

type AuthState = {
  Username: null | string;
  UserEmail: null | string;
  UserId: null | number;
};

type AuthAction = {
  updateAuth: (auth: AuthState) => void;
};

export const useAuthStore = create<AuthState & AuthAction>()((set) => ({
  Username: null,
  UserEmail: null,
  UserId: null,
  updateAuth: (auth) =>
    set({
      Username: auth.UserEmail,
      UserEmail: auth.UserEmail,
      UserId: auth.UserId,
    }),
}));
