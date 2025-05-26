import { ClassSchedule } from "@/types/schedule.interface";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { TDocumentDefinitions } from "pdfmake/interfaces";

pdfMake.vfs = pdfFonts.vfs;
pdfMake.fonts = {
  Roboto: {
    normal: "Roboto-Regular.ttf",
    bold: "Roboto-Medium.ttf",
    italics: "Roboto-Italic.ttf",
    bolditalics: "Roboto-MediumItalic.ttf",
  },
};

export const exportScheduleToPDF = (group: ClassSchedule) => {
  const content: any[] = [];

  group.week.forEach((day) => {
    content.push({
      text: `День: ${day.day}`,
      style: "dayHeader",
      margin: [0, 16, 0, 8],
    });

    const tableBody = [
      [
        { text: "Предмет", style: "tableHeader" },
        { text: "Викладач", style: "tableHeader" },
      ],
      ...day.lessons.map((lesson) =>
        lesson ? [lesson.subject, lesson.teacher] : ["—", ""],
      ),
    ];

    content.push({
      table: {
        headerRows: 1,
        widths: ["*", "*"],
        body: tableBody,
      },
      layout: {
        fillColor: (rowIndex: number) => {
          return rowIndex === 0
            ? "#f3f4f6"
            : rowIndex % 2 === 0
              ? "#ffffff"
              : "#fafafa";
        },
        hLineColor: "#e5e7eb",
        vLineColor: "#e5e7eb",
      },
    });
  });

  const docDefinition: TDocumentDefinitions = {
    content,
    defaultStyle: {
      font: "Roboto",
      fontSize: 11,
      color: "#222222",
    },
    styles: {
      dayHeader: {
        fontSize: 15,
        bold: true,
        margin: [0, 10, 0, 4],
      },
      tableHeader: {
        bold: true,
        fillColor: "#f3f4f6",
        color: "#222222",
        alignment: "center",
      },
    },
    pageMargins: [40, 40, 40, 40],
  };

  pdfMake.createPdf(docDefinition).download(`${group.class_name}-schedule.pdf`);
};
