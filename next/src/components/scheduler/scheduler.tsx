"use client";

import { FC, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ScheduleView } from "../schedule-view/ScheduleView";
import { ClassSchedule, ExoticScheduleType } from "@/types/schedule.interface";
import { exportScheduleToPDF } from "@/helpers/exports_formats/pdf";
import { exportScheduleToExcel } from "@/helpers/exports_formats/excel";
import { exportScheduleToJSON } from "@/helpers/exports_formats/json";
import { Download } from "lucide-react";
import { useStore } from "zustand";
import { createScheduleStore } from "@/store/schedules.store";
import { Card, CardTitle } from "../ui/card";
import { isEmpty, isNil } from "ramda";

type schedulerProps = {
  schedules: ExoticScheduleType[]
};

export const Scheduler: FC<schedulerProps> = ({ schedules }) => {
  const store = createScheduleStore({ currentSelectedSchedules: schedules });
  const { currentSelectedSchedules } = useStore(store, (store) => store);
  const [selected, setSelected] = useState<ClassSchedule | null>(currentSelectedSchedules?.[0]?.json_data?.[0] as ClassSchedule);


  useEffect(() => {
    console.log(selected);
  }, [selected]);


  const exportToPDF = (schedule: ClassSchedule | null) => {
    if (schedule)
    exportScheduleToPDF(schedule);
  };

  const exportToEXCEL = (schedule: ClassSchedule | null) => {
    if (schedule)
    exportScheduleToExcel(schedule);
  };

  const exportToJSON = (schedule: ClassSchedule | null) => {
    if (schedule)
    exportScheduleToJSON(schedule);
  };

  console.log(schedules, isEmpty(schedules));

  if (isEmpty(schedules)) {
    return (
      <div className="flex flex-row justify-center"><Card className="w-[37vw] h-[20vh] flex flex-row justify-center items-center">
        <CardTitle className="">Немає обраного розкладку</CardTitle>
      </Card>
      </div>
    )
  }

  return (
    <>
    <ScheduleView
      schedule={currentSelectedSchedules}
      setSelectedAction={setSelected}
    />

    <div className="flex flex-wrap gap-4 pt-6">
      <Button
        disabled={!selected}
        onClick={() => exportToPDF(selected)}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" /> PDF
      </Button>
      <Button
        disabled={!selected}
        onClick={() => exportToEXCEL(selected)}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" /> Excel
      </Button>
      <Button
        disabled={!selected}
        onClick={() => exportToJSON(selected)}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" /> JSON
      </Button>
    </div>
    </>
  )
}
