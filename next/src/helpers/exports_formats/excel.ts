import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { ClassSchedule } from "@/types/schedule.interface";

export const exportScheduleToExcel = (group: ClassSchedule) => {
  const sheetData: any[][] = [];

  group.week.forEach((day) => {
    sheetData.push([day.day]); // Назва дня
    sheetData.push(["Предмет", "Викладач"]);

    day.lessons.forEach((lesson) => {
      if (lesson) {
        sheetData.push([lesson.subject, lesson.teacher]);
      } else {
        sheetData.push(["—", ""]);
      }
    });

    sheetData.push([]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Розклад");

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });

  saveAs(blob, "schedule.xlsx");
};
