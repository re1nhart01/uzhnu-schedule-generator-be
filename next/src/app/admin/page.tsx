"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ScheduleView } from "@/components/schedule-view/ScheduleView";
import { MOCK_SCHEDULE } from "@/mock/MOCK_SCHEDULE";
import { useScheduleStore } from "@/store/schedules.store";
import { DnDScheduleView } from "@/components/dnd-schedule-view/DnDScheduleView";
import { UpdateModal } from "@/components/update-modal/update-modal";

export default function ScheduleConfigPage() {
  const router = useRouter();
  const { generateSchedule, currentGeneratedSchedule } = useScheduleStore();
  const [schedule, setSchedule] = useState(currentGeneratedSchedule);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);

  const handleNavigateAdmin = () => {
    window.open(
      `${process.env.NEXT_PUBLIC_API_URL}admin/`,
      "_blank",
      "rel=noopener noreferrer",
    );
  };

  const handleGenerate = async () => {
    await generateSchedule();
  };

  const handleRemoveItem = useCallback(() => {}, []);

  const handleUpdateItem = useCallback(() => {}, []);

  useEffect(() => {
    setSchedule(currentGeneratedSchedule);
  }, [currentGeneratedSchedule]);

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 space-y-6 min-h-[87vh]">
      {currentGeneratedSchedule.length <= 0 ? (
        <Card className="w-[37vw] h-[20vh] flex flex-row justify-center items-center">
          <CardTitle className="">Немає згенерованого розкладку</CardTitle>
        </Card>
      ) : (
        <DnDScheduleView
          schedule={currentGeneratedSchedule}
          setScheduleAction={setSchedule}
        />
      )}
      <Card>
        <CardHeader>
          <CardTitle>Налаштування розкладу</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="pt-4">
            <Button onClick={handleGenerate} className="w-full">
              Згенерувати розклад
            </Button>
            <Button
              variant="outline"
              onClick={handleNavigateAdmin}
              className="w-full mt-2"
            >
              Зберегти змінений розклад
            </Button>
            <Button
              variant="link"
              onClick={handleNavigateAdmin}
              className="w-full mt-4"
            >
              Редагувати конфігурацію розкладу
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
