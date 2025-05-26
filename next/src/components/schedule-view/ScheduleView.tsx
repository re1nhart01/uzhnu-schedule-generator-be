"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { ClassSchedule, Lesson } from "@/types/schedule.interface";
import { Dispatch, SetStateAction } from "react";

interface ScheduleViewProps {
  schedule: ClassSchedule[];
  setSelectedAction: Dispatch<SetStateAction<ClassSchedule>>;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  schedule,
  setSelectedAction,
}) => {
  return (
    <Tabs
      defaultValue={schedule[0]?.class_name}
      className="w-full h-full flex flex-col items-center"
    >
      <TabsList className="flex flex-wrap gap-2 mb-4">
        {schedule.map((group) => (
          <TabsTrigger
            key={group.class_name}
            value={group.class_name}
            onSelect={() => setSelectedAction(group)}
          >
            {group.class_name}
          </TabsTrigger>
        ))}
      </TabsList>

      {schedule.map((group) => (
        <TabsContent
          key={group.class_name}
          value={group.class_name}
          className="w-[80vw] h-[60vh]"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {group.week.map((dayItem, index) => (
              <div
                key={index}
                className="border rounded-lg shadow-sm overflow-hidden bg-card"
              >
                <div className="bg-muted px-4 py-2 font-semibold text-foreground">
                  {dayItem.day}
                </div>
                <ul>
                  {dayItem.lessons.map((lesson, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center border-t px-4 py-3 text-sm"
                    >
                      {lesson ? (
                        <>
                          <span className="text-foreground">
                            {lesson.subject}
                          </span>
                          <span className="text-muted-foreground">
                            {lesson.teacher}
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
