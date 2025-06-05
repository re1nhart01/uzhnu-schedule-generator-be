"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dispatch, SetStateAction, useState } from "react";
import type {
  ClassSchedule,
  ExoticScheduleType,
} from "@/types/schedule.interface";

interface ScheduleViewProps {
  schedule: ExoticScheduleType[];
  setSelectedAction: Dispatch<SetStateAction<ClassSchedule | null>>;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  schedule,
  setSelectedAction,
}) => {
  const [selectedDate, setSelectedDate] = useState(schedule[0]?.created_at);

  return (
    <Tabs
      defaultValue={selectedDate}
      onValueChange={setSelectedDate}
      className="w-full h-full flex flex-col items-center"
    >
      <TabsList className="flex flex-wrap gap-2 mb-4">
        {schedule.map((entry) => (
          <TabsTrigger key={entry.id} value={entry.created_at}>
            {entry.created_at}
          </TabsTrigger>
        ))}
      </TabsList>
      {schedule.map((entry) => (
        <TabsContent key={entry.id} value={entry.created_at} className="w-full">
          <Tabs
            defaultValue={entry.json_data[0]?.class_name}
            className="w-full h-full flex flex-col items-center"
          >
            <TabsList className="flex flex-wrap gap-2 mb-4">
              {entry.json_data.map((classSchedule) => (
                <TabsTrigger
                  key={classSchedule.class_name}
                  value={classSchedule.class_name}
                  onClick={() => setSelectedAction(classSchedule)}
                >
                  {classSchedule.class_name}
                </TabsTrigger>
              ))}
            </TabsList>

            {entry.json_data.map((classSchedule) => (
              <TabsContent
                key={classSchedule.class_name}
                value={classSchedule.class_name}
                className="w-[80vw] h-[60vh]"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {classSchedule.week.map((dayItem, index) => (
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
        </TabsContent>
      ))}
    </Tabs>
  );
};
