"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { DnDScheduleView } from "@/components/dnd-schedule-view/DnDScheduleView";
import { useAdminConfigStore } from "@/store/admin-config.store";
import { useSnackbarStore } from "@/store/snackbar.store";
import { isEmpty } from "ramda";

export default function ScheduleConfigPage() {
  const router = useRouter();
  const { generateSchedule, currentGeneratedSchedule, allSubjects, getAllSubjects, saveSchedule, allDates, getHistory } = useAdminConfigStore();
  const [schedule, setSchedule] = useState(currentGeneratedSchedule);
  const [loading, setLoading] = useState(false);

  const handleNavigateAdmin = () => {
    window?.open(`${process.env.NEXT_PUBLIC_API_URL}admin/`, '_blank');
  };

  const handleNavigateWatchAndDelete = () => {
    router.push("/admin/watch-and-delete")
  };

  const handleGenerate = async () => {
    await generateSchedule();
  };

  const handleSaveSchedule = async () => {
    setLoading(true);
    try {
      await saveSchedule(schedule);

      useSnackbarStore.getState().showSnackbar({
          title: "Збережено",
          description: "Ваші розклади збережено успішно.",
          type: "success",
          action: () => {
            console.log("Кнопка натиснута")
          },
          actionLabel: "Зберегти",
        })
    } catch (e) {
      useSnackbarStore.getState().showSnackbar({
          title: "Помилка",
          description: "Виникла помилка при видаленні",
          type: "error",
          action: () => {
            console.log("Кнопка натиснута")
          },
          actionLabel: "Зберегти",
        })
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    Promise.all([
      getHistory(),
      getAllSubjects(),
    ]).then()
  }, [])

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
          allSubjects={allSubjects ?? []}
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
              disabled={loading || isEmpty(schedule)}
              variant="outline"
              onClick={handleSaveSchedule}
              className="w-full mt-2"
            >
              {loading ? "Збереження..." : "Зберегти змінений розклад"}
            </Button>
            <Button
              variant="link"
              onClick={handleNavigateWatchAndDelete}
              className="w-full mt-4"
            >
              Переглянути і видалити обрані розклади
            </Button>
          </div>
        </CardContent>
      </Card>
      <Button
        variant="link"
        onClick={handleNavigateAdmin}
        className="w-full mt-4"
      >
        Редагувати конфігурацію розкладу
      </Button>
    </div>
  );
}
