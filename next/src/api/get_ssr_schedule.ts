import { requester } from "@/services/http/requestor";
import { ClassSchedule, ExoticScheduleType, ScheduleHistory, Subject } from "@/types/schedule.interface";
import { getDates } from "@/helpers/functions";

export const fetchScheduleHistory = async (): Promise<ScheduleHistory[]> => {
  try {
    const { data } = await requester<ScheduleHistory[]>("api/schedule/history/", "GET", {
      "X-CSRFTOKEN": process.env.NEXT_PUBLIC_CSRF_TOKEN ?? "",
    });

    return data;
  } catch (e) {
    console.warn("Failed to fetch schedule history", e);
    return [];
  }
};

export const fetchSchedulesByDates = async (dates: string[]): Promise<ExoticScheduleType[]> => {
  try {
    const { data } = await requester<ExoticScheduleType[]>(
      `api/schedule/get-by-dates${getDates(dates)}`,
      "GET",
      {
        "X-CSRFTOKEN": process.env.NEXT_PUBLIC_CSRF_TOKEN ?? "",
      },
    );

    return data;
  } catch (e) {
    console.warn("Failed to fetch schedule by dates", e);
    return [];
  }
};
