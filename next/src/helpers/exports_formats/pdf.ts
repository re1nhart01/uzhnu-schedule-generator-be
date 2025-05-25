import { ClassSchedule } from "@/types/schedule.interface";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportScheduleToPDF = (group: ClassSchedule) => {
  const doc = new jsPDF();

  group.week.forEach((day, index) => {
    doc.setFontSize(14);
    doc.text(day.day, 14, 10 + index * 60);

    const rows = day.lessons.map((lesson) =>
      lesson ? [lesson.subject, lesson.teacher] : ["—", ""],
    );

    autoTable(doc, {
      startY: 14 + index * 60,
      head: [["Предмет", "Викладач"]],
      body: rows,
      theme: "striped",
      styles: { fontSize: 10 },
    });
  });

  doc.save("schedule.pdf");
};
