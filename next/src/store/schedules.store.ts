import { requester } from "@/services/http/requestor";
import { ClassSchedule } from "@/types/schedule.interface";
import { create, createStore } from "zustand";

type scheduleStoreModel = {
  currentGeneratedSchedule: ClassSchedule[];
  setCurrentSchedule: (schedule: ClassSchedule[]) => void;
  generateSchedule: () => Promise<void>;
};

export const useScheduleStore = create<scheduleStoreModel>(
  (set, getState, store) => ({
    currentGeneratedSchedule: [],
    setCurrentSchedule: (schedule: ClassSchedule[]) =>
      set({ currentGeneratedSchedule: schedule }),
    generateSchedule: async () => {
      try {
        const { data } = await requester<{ schedule: ClassSchedule[] }>(
          "api/schedule/generate-schedule/manually/",
          "POST",
          void 0,
          {
            "X-CSRFTOKEN": process.env.NEXT_PUBLIC_CSRF_TOKEN,
          },
        );

        if (Array.isArray(data["schedule"])) {
          set({ currentGeneratedSchedule: data["schedule"] });
        }
      } catch (e) {
        console.warn(e);
      }
    },
  }),
);
