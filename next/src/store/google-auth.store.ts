import { requester } from "@/services/http/requestor";
import { create, createStore } from "zustand";
import "@/services/http/axios.config";

type googleAuthStoreModel = {
  redirectUrl: string | null;
  loading: boolean;
  getRedirectUrl(): Promise<void>;
};

export const useGoogleAuthStore = create<googleAuthStoreModel>(
  (set, getState, store) => ({
    redirectUrl: null,
    loading: false,
    setRedirectUrl: (url: string) => set((state) => ({ redirectUrl: url })),
    getRedirectUrl: async () => {
      set({ loading: true });
      try {
        const data = await requester<{ url: string }>(
          "api/auth/google/get-redirect-uri/",
          "GET",
          {
            "Content-Type": "application/json",
          },
        );

        set({ loading: false, redirectUrl: data.data.url });
      } catch (e) {
        console.warn("useGoogleAuthStore ex", e);
      }
    },
  }),
);
