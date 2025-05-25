"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, Download } from "lucide-react";
import { ScheduleView } from "@/components/schedule-view/ScheduleView";
import { MOCK_SCHEDULE } from "@/mock/MOCK_SCHEDULE";
import { exportScheduleToExcel } from "@/helpers/exports_formats/excel";
import { exportScheduleToJSON } from "@/helpers/exports_formats/json";
import { exportScheduleToPDF } from "@/helpers/exports_formats/pdf";
import { ClassSchedule } from "@/types/schedule.interface";

export default function HomePage() {
  const [selected, setSelected] = useState(MOCK_SCHEDULE.schedule[0]);
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
      </div>

      <ScheduleView
        schedule={MOCK_SCHEDULE.schedule}
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
    </div>
  );
}
