import { create } from "zustand";
import { ExoticScheduleType, LessonSlot, ScheduleHistory } from "@/types/schedule.interface";
import { requester } from "@/services/http/requestor";
import { getDates } from "@/helpers/functions";

export type ScheduleStoreModel = {
  allDates: ScheduleHistory[];
  currentSelectedSchedules: ExoticScheduleType[];
  getHistory: () => Promise<void>;
  getByDates: (dates: string[]) => Promise<void>;
  setUnavailableSlots: (data: LessonSlot[]) => Promise<void>;
};

export const createScheduleStore = (
  initialState?: Partial<Pick<ScheduleStoreModel, "currentSelectedSchedules" | "allDates">>
) =>
  create<ScheduleStoreModel>((set, get) => ({
    allDates: initialState?.allDates ?? [],
    currentSelectedSchedules: initialState?.currentSelectedSchedules ?? [],
    getHistory: async () => {
      try {
        const { data } = await requester<ScheduleHistory[]>(
          "api/schedule/history/",
          "GET",
          {
            "X-CSRFTOKEN": process.env.NEXT_PUBLIC_CSRF_TOKEN ?? "",
          },
        );
        set({ allDates: data });
      } catch (e) {
        console.warn(e);
      }
    },
    getByDates: async (dates: string[]) => {
      try {
        const { data } = await requester<ExoticScheduleType[]>(
          `api/schedule/get-by-dates${getDates(dates)}`,
          "GET",
          {
            "X-CSRFTOKEN": process.env.NEXT_PUBLIC_CSRF_TOKEN ?? "",
          },
        );
        set({ currentSelectedSchedules: data });
      } catch (e) {
        console.warn(e);
      }
    },
    setUnavailableSlots: async (schedule) => {
      try {
        await requester<unknown, { unavailable_slots: LessonSlot[] }>(
          "api/schedule/teachers/unavailable-slots/",
          "POST",
          {
            "X-CSRFTOKEN": process.env.NEXT_PUBLIC_CSRF_TOKEN ?? "",
          },
          { unavailable_slots: schedule },
        );
      } catch (e) {
        console.warn("Failed to send unavailable slots", e);
      }
    },
  }));


export const useAdminScheduleStore = createScheduleStore();
