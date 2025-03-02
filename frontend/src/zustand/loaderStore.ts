import { create } from "zustand";

type LoadersKeys = "CHAT_LOADING" | "CREATE_CHAT";

interface LoadersState {
  loaders: Record<LoadersKeys, boolean>;
}

interface LoadersActions {
  setLoading: (key: LoadersKeys, value: boolean) => void;
}

const initialState: LoadersState = {
  loaders: {
    CHAT_LOADING: false,
    CREATE_CHAT: false,
  },
};

const useLoadersStore = create<LoadersState & LoadersActions>()((set) => ({
  ...initialState,
  setLoading: (key, value) =>
    set((state) => ({ loaders: { ...state.loaders, [key]: value } })),
}));

export default useLoadersStore;
