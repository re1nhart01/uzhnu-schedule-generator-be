import { requester } from "@/services/http/requestor";
import { ClassSchedule, ScheduleHistory, Subject } from "@/types/schedule.interface";
import { create } from "zustand";

type adminConfigStoreType = {
  allSubjects: Subject[];
  allDates: ScheduleHistory[];
  currentGeneratedSchedule: ClassSchedule[];
  generateSchedule: () => Promise<void>;
  getAllSubjects: () => Promise<void>;
  getHistory: () => Promise<void>;
  saveSchedule: (data: ClassSchedule[]) => Promise<void>;
  setCurrentSchedule: (schedule: ClassSchedule[]) => void;
};;

export const useAdminConfigStore = create<adminConfigStoreType>(
  (set, getState, store) => ({
    allSubjects: [],
    allDates: [],
     currentGeneratedSchedule: [],
     setCurrentSchedule: (schedule) => set({ currentGeneratedSchedule: schedule }),
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
         throw e;
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
  }),

);
