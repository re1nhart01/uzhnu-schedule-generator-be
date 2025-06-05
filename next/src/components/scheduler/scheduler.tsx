"use client";

import { FC, useState } from "react";
import { Button } from "../ui/button";
import { ScheduleView } from "../schedule-view/ScheduleView";
import { ClassSchedule, ExoticScheduleType } from "@/types/schedule.interface";
import { exportScheduleToPDF } from "@/helpers/exports_formats/pdf";
import { exportScheduleToExcel } from "@/helpers/exports_formats/excel";
import { exportScheduleToJSON } from "@/helpers/exports_formats/json";
import { Download } from "lucide-react";
import { StoreApi, useStore } from "zustand";
import { createScheduleStore, ScheduleStoreModel } from "@/store/schedules.store";

type schedulerProps = {
  schedules: ExoticScheduleType[]
};

export const Scheduler: FC<schedulerProps> = ({ schedules }) => {
  const store = createScheduleStore({ currentSelectedSchedules: schedules });
  const { currentSelectedSchedules } = useStore(store, (store) => store);
  const [selected, setSelected] = useState<ClassSchedule>(
    currentSelectedSchedules[0].json_data[0] as ClassSchedule,
  );


  const exportToPDF = (schedule: ClassSchedule) => {
    exportScheduleToPDF(schedule);
  };

  const exportToEXCEL = (schedule: ClassSchedule) => {
    exportScheduleToExcel(schedule);
  };

  const exportToJSON = (schedule: ClassSchedule) => {
    exportScheduleToJSON(schedule);
  };

  return (
    <>
    <ScheduleView
      schedule={currentSelectedSchedules}
      setSelectedAction={setSelected}
    />

    <div className="flex flex-wrap gap-4 pt-6">
      <Button
        onClick={() => exportToPDF(selected)}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" /> PDF
      </Button>
      <Button
        onClick={() => exportToEXCEL(selected)}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" /> Excel
      </Button>
      <Button
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
