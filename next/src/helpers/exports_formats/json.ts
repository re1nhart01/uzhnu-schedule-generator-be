import { ClassSchedule } from "@/types/schedule.interface";
import { saveAs } from "file-saver";

export const exportScheduleToJSON = (group: ClassSchedule) => {
  const jsonBlob = new Blob([JSON.stringify(group, null, 2)], {
    type: "application/json",
  });

  saveAs(jsonBlob, "schedule.json");
};
