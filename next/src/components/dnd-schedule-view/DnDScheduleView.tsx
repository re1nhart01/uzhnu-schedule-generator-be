"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { ClassSchedule, Lesson } from "@/types/schedule.interface"; // або звідки ти експортуєш
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface ScheduleViewProps {
  schedule: ClassSchedule[];
  setScheduleAction: Dispatch<SetStateAction<ClassSchedule[]>>;
}

export const DnDScheduleView: React.FC<ScheduleViewProps> = ({
  schedule,
  setScheduleAction,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
  };

  const handleDrop = (index: number, groupIndex: number, dayIndex: number) => {
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...schedule];

    const [movedItem] = newItems[groupIndex].week[dayIndex].lessons.splice(
      draggedIndex,
      1,
    );
    newItems[groupIndex].week[dayIndex].lessons.splice(index, 0, movedItem);

    setScheduleAction(newItems);
    setDraggedIndex(null);
  };

  return (
    <Tabs
      defaultValue={schedule[0]?.class_name}
      className="w-full h-full flex flex-col items-center"
    >
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
              <div
                key={dayIndex}
                className="border rounded-lg shadow-sm overflow-hidden bg-card"
              >
                <div className="bg-muted px-4 py-2 font-semibold text-foreground">
                  {dayItem.day}
                </div>
                <ul>
                  {dayItem.lessons.map((lesson, i) => (
                    <li
                      draggable
                      onDragStart={() => handleDragStart(i)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(i, groupIndex, dayIndex)}
                      key={i}
                      className="flex justify-between items-center border-t px-4 py-3 text-sm"
                    >
                      {lesson ? (
                        <>
                          <span className="text-foreground">
                            {lesson?.subject}
                          </span>
                          <span className="text-muted-foreground">
                            {lesson?.teacher}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground italic w-full text-center">
                          —
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};
