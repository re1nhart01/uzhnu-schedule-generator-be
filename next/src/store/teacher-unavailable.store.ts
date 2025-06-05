import { requester } from "@/services/http/requestor";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { UserCredentials } from "./google-auth.store";

export interface TeacherUnavailableSlot {
  id: number;
  teacher: string;
  day: number;
  lesson_number: number;
}

interface TeacherUnavailableState {
  slots: TeacherUnavailableSlot[];
  isLoading: boolean;
  error: string | null;

  getSlots: (token: string) => Promise<void>;
  createBulkSlots: (slots: (TeacherUnavailableSlot & { teacher_email: string })[], token: string) => Promise<void>;
  saveUnavailableState: (data: Record<number, number[]>, token: string, me: UserCredentials) => Promise<void>;
  clearSlots: () => void;
}

export const useTeacherUnavailableStore = create<TeacherUnavailableState>()(
  immer((set, get) => ({
    slots: [],
    isLoading: false,
    error: null,

    getSlots: async (token) => {
      set({ isLoading: true, error: null });
      try {
        const { data } = await requester<TeacherUnavailableSlot[]>(
          "api/schedule/teachers/unavailable-slots/",
          "GET",
          { Authorization: `Bearer ${token}` },
          undefined,
          true, // withRefreshing
        );
        set({ slots: data });
      } catch (error: any) {
        set({ error: error.message || "Помилка запиту" });
      } finally {
        set({ isLoading: false });
      }
    },

    createBulkSlots: async (slots, token) => {
      set({ isLoading: true, error: null });
      try {
        const { data } = await requester<TeacherUnavailableSlot[]>(
          "api/schedule/teachers/unavailable-slots/",
          "POST",
          { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          { unavailable_slots: slots },
          true,
        );
        set((state) => {
          state.slots.push(...data);
        });
      } catch (error: any) {
        set({ error: error.message || "Помилка створення" });
      } finally {
        set({ isLoading: false });
      }
    },

    saveUnavailableState: async (unavailable, token, me) => {
      if (!me) return;
      const slots = Object.entries(unavailable).flatMap(([day, lessons]) =>
        lessons.map((lesson_number) => ({
          day: parseInt(day),
          lesson_number,
          teacher_email: `${me.email}`,
        }))
      );
      await get().createBulkSlots(slots as any[], token);
    },

    clearSlots: () => set({ slots: [] }),
  }))
);
