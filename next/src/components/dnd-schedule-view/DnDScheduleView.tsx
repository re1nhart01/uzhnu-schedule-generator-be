"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { ClassSchedule, Subject } from "@/types/schedule.interface";
import { Dispatch, SetStateAction, useState } from "react";
import "./dnd_schedule_view.styles.css";
import { GripVertical, Plus, Trash, X } from "lucide-react";

interface ScheduleViewProps {
  schedule: ClassSchedule[];
  setScheduleAction: Dispatch<SetStateAction<ClassSchedule[]>>;
  allSubjects: Subject[];
}

export const DnDScheduleView: React.FC<ScheduleViewProps> = ({
  schedule,
  allSubjects,
  setScheduleAction,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => e.preventDefault();

  const handleDrop = (index: number, groupIndex: number, dayIndex: number) => {
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...schedule];
    const lessons = newItems[groupIndex].week[dayIndex].lessons;

    const [movedItem] = lessons.splice(draggedIndex, 1);
    lessons.splice(index, 0, movedItem);

    setScheduleAction(newItems);
    setDraggedIndex(null);
  };

  const handleSelectSubject = (
    groupIndex: number,
    dayIndex: number,
    lessonIndex: number,
    subjectStr: string
  ) => {
    const subject = allSubjects.find((s) => s.subject === subjectStr);
    if (!subject) return;

    const updatedSchedule = [...schedule];
    updatedSchedule[groupIndex].week[dayIndex].lessons[lessonIndex] = {
      subject: subject.subject,
      teacher: subject.teacher,
      dndId: Math.random().toString(36).substring(2),
    };

    setScheduleAction(updatedSchedule);
  };

  const handleAddLesson = (groupIndex: number, dayIndex: number) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[groupIndex].week[dayIndex].lessons.push(null);
    setScheduleAction(updatedSchedule);
  };

  const handleRemoveLesson = (groupIndex: number, dayIndex: number, lessonIndex: number) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[groupIndex].week[dayIndex].lessons.splice(lessonIndex, 1);
    setScheduleAction(updatedSchedule);
  };

  return (
    <Tabs defaultValue={schedule[0]?.class_name} className="w-full h-full flex flex-col items-center">
      <TabsList className="flex flex-wrap gap-2 mb-4">
        {schedule.map((group) => (
          <TabsTrigger key={group.class_name} value={group.class_name}>
            {group.class_name}
          </TabsTrigger>
        ))}
      </TabsList>

      {schedule.map((group, groupIndex) => (
        <TabsContent
          key={group.class_name}
          value={group.class_name}
          className="w-[80vw] h-[60vh]"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {group.week.map((dayItem, dayIndex) => (
              <div key={dayIndex} className="border rounded-lg shadow-sm overflow-hidden bg-card">
                <div className="bg-muted px-4 py-2 font-semibold text-foreground">
                  {dayItem.day}
                </div>
                <div className="flex flex-col justify-between">
                <ul>
                  {dayItem.lessons.map((lesson, lessonIndex) => (
                    <li
                      key={lessonIndex}
                      draggable
                      onDragStart={() => handleDragStart(lessonIndex)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(lessonIndex, groupIndex, dayIndex)}
                      className="flex justify-between items-center border-t px-4 py-3 text-sm dnd-schedule-item__container"
                    >
                      {lesson ? (
                        <>
                          <span className="text-foreground">{lesson.subject}</span>
                          <span className="text-muted-foreground">{lesson.teacher}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground italic w-full text-center">
                          —
                        </span>
                      )}
                      <div className="dnd-schedule-item__overlay gap-4">
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                        <select
                          value={lesson?.subject ?? ""}
                          onChange={(e) =>
                            handleSelectSubject(groupIndex, dayIndex, lessonIndex, e.target.value)
                          }
                          className="w-full px-3 py-2 border rounded-md text-sm bg-white text-black"
                        >
                          <option disabled value="">
                            Оберіть предмет
                          </option>
                          {allSubjects.map((subject) => (
                            <option key={subject.subject} value={subject.subject}>
                              {subject.subject} - {subject.teacher}
                            </option>
                          ))}
                        </select>
                        <Trash
                          onClick={() => handleRemoveLesson(groupIndex, dayIndex, lessonIndex)}
                          className="cursor-pointer"
                          color="#AA4A44"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleAddLesson(groupIndex, dayIndex)}
                  className="w-full flex items-center justify-center gap-2 py-2 border-t text-sm text-primary hover:bg-muted transition"
                >
                  <Plus className="w-4 h-4" />
                  Додати урок
                </button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};
