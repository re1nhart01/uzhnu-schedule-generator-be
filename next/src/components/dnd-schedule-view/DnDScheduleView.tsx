"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { ClassSchedule, Lesson } from "@/types/schedule.interface"; // або звідки ти експортуєш
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ScheduleItem } from "./content/schedule-item/schedule-item";

interface ScheduleViewProps {
  schedule: ClassSchedule[];
  setScheduleAction: Dispatch<SetStateAction<ClassSchedule[]>>;
}

export const DnDScheduleView: React.FC<ScheduleViewProps> = ({
  schedule,
  setScheduleAction,
}) => {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any, groupIndex: number, dayIndex: number) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setScheduleAction((prev) => {
      const updated = [...prev];

      const lessons = [...updated[groupIndex].week[dayIndex].lessons];

      const oldIndex = lessons.findIndex(
        (_, i) => `${dayIndex}-${i}` === active.id,
      );

      const newIndex = lessons.findIndex(
        (_, i) => `${dayIndex}-${i}` === over.id,
      );

      console.log(
        oldIndex,
        newIndex,
        updated[groupIndex].week[dayIndex].lessons[oldIndex],
      );

      const temp = updated[groupIndex].week[dayIndex].lessons[oldIndex];
      updated[groupIndex].week[dayIndex].lessons[oldIndex] =
        updated[groupIndex].week[dayIndex].lessons[newIndex];
      updated[groupIndex].week[dayIndex].lessons[newIndex] = temp;

      return updated;
    });
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
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) =>
                    handleDragEnd(event, groupIndex, dayIndex)
                  }
                >
                  <SortableContext
                    items={dayItem.lessons.map((_, i) => `${dayIndex}-${i}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    <ul>
                      {dayItem.lessons.map((lesson, i) => (
                        <ScheduleItem
                          key={`${dayIndex}-${i}`}
                          integer={`${dayIndex}-${i}`}
                          id={`${dayIndex}-${i}`}
                          lesson={lesson}
                        />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              </div>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};
