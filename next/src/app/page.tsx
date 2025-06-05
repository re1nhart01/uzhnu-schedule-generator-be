"use server";

import { CalendarDays } from "lucide-react";
import { Scheduler } from "@/components/scheduler/scheduler";
import { Suspense } from "react";
import { SpinnerCentered } from "@/components/spinner/spinner";
import { fetchScheduleHistory, fetchSchedulesByDates } from "@/api/get_ssr_schedule";
import { DateSelectForm } from "@/components/date-select-form/date-select.form";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ dates?: string }> }) {
  const fetchedDates = await fetchScheduleHistory();

  const search = await searchParams;

  const dates = search?.dates?.split(",") ?? [];
  const schedules = dates.length > 0 ? await fetchSchedulesByDates(dates) : [];

  return (
    <Suspense fallback={<div className="flex-1"><SpinnerCentered /></div>}>
      <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6 w-full h-full flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
              <CalendarDays className="w-6 h-6 text-primary" /> Розклад на тиждень
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Оберіть групу та експортуйте у зручному форматі
            </p>
          </div>
          <div className="flex flex-row gap-4">
              <DateSelectForm availableDates={fetchedDates?.map((date) => date.created_at) ?? []} selectedDates={dates ?? []} />
          </div>
        </div>
        <Suspense fallback={<SpinnerCentered />}>
          <Scheduler schedules={schedules} />
        </Suspense>
      </div>
    </Suspense>
  );
}
