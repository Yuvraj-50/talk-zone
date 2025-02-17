import { create } from "zustand";

type AuthState = {
  Username: null | string;
  UserEmail: null | string;
  UserId: null | number;
  authenticated: boolean;
};

type AuthAction = {
  updateAuth: (auth: AuthState) => void;
};

export const useAuthStore = create<AuthState & AuthAction>()((set) => ({
  Username: null,
  UserEmail: null,
  UserId: null,
  authenticated: false,
  updateAuth: (auth) =>
    set({
      Username: auth.UserEmail,
      UserEmail: auth.UserEmail,
      UserId: auth.UserId,
      authenticated: auth.authenticated,
    }),
}));
