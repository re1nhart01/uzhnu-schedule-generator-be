import { requester } from "@/services/http/requestor";
import { create, createStore } from "zustand";
import "@/services/http/axios.config";
import { getUserDataOutOfReact } from "@/hooks/useUserCredentials";

export type UserCredentials = {
  email: string;
  first_name: string;
  image_url: string;
  last_name: string;
  role: string;
};

type googleAuthStoreModel = {
  redirectUrl: string | null;
  loading: boolean;
  userData: UserCredentials | null;
  getRedirectUrl(): Promise<void>;
  getWhoami(): Promise<void>;
  setNullUserData(): void;
};

export const useGoogleAuthStore = create<googleAuthStoreModel>(
  (set, getState, store) => ({
    redirectUrl: null,
    userData: null,
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
    getWhoami: async () => {
      set({ loading: true });

      const accessToken = getUserDataOutOfReact()?.access_token;
      if (!accessToken) return;
      try {
        const data = await requester<any>("api/auth/whoami/", "GET", {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        });

        console.log(data.data);

        set({ loading: false, userData: data.data });
      } catch (e) {
        console.warn(e);
      }
    },
    setNullUserData: () =>
      set({ loading: false, redirectUrl: "", userData: null }),
  }),
);
