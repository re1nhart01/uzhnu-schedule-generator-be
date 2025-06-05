import { create, createStore, StoreApi } from "zustand";
import { ClassSchedule, ExoticScheduleType, LessonSlot, ScheduleHistory, Subject } from "@/types/schedule.interface";
import { requester } from "@/services/http/requestor";
import { getDates } from "@/helpers/functions";

export type ScheduleStoreModel = {
  allSubjects: Subject[];
  allDates: ScheduleHistory[];
  currentGeneratedSchedule: ClassSchedule[];
  currentSelectedSchedules: ExoticScheduleType[];
  setCurrentSchedule: (schedule: ClassSchedule[]) => void;
  generateSchedule: () => Promise<void>;
  getAllSubjects: () => Promise<void>;
  getHistory: () => Promise<void>;
  getByDates: (dates: string[]) => Promise<void>;
  saveSchedule: (data: ClassSchedule[]) => Promise<void>;
  setUnavailableSlots: (data: LessonSlot[]) => Promise<void>;
};

export const createScheduleStore = (
  initialState?: Partial<Pick<ScheduleStoreModel, "allSubjects" | "currentGeneratedSchedule" | "currentSelectedSchedules" | "allDates">>
) =>
  create<ScheduleStoreModel>((set, get) => ({
    allSubjects: initialState?.allSubjects ?? [],
    allDates: initialState?.allDates ?? [],
    currentSelectedSchedules: initialState?.currentSelectedSchedules ?? [],
    currentGeneratedSchedule: initialState?.currentGeneratedSchedule ?? [],
    setCurrentSchedule: (schedule) => set({ currentGeneratedSchedule: schedule }),

    generateSchedule: async () => {
      try {
        const { data } = await requester<{ schedule: ClassSchedule[] }>(
          "api/schedule/generate-schedule/manually/",
          "POST",
          {
            "X-CSRFTOKEN": process.env.NEXT_PUBLIC_CSRF_TOKEN ?? "",
          },
        );

        if (Array.isArray(data.schedule)) {
          set({ currentGeneratedSchedule: data.schedule });
        }
      } catch (e) {
        console.warn(e);
      }
    },

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

    getAllSubjects: async () => {
      try {
        const { data } = await requester<Subject[]>(
          "api/schedule/teachers-subjects/",
          "GET",
          {
            "X-CSRFTOKEN": process.env.NEXT_PUBLIC_CSRF_TOKEN ?? "",
          },
        );
        set({ allSubjects: data });
      } catch (e) {
        console.warn(e);
      }
    },

    saveSchedule: async (schedule) => {
      try {
        await requester<unknown, { schedule: ClassSchedule[] }>(
          "api/schedule/save/",
          "POST",
          {
            "X-CSRFTOKEN": process.env.NEXT_PUBLIC_CSRF_TOKEN ?? "",
          },
          { schedule },
        );
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
