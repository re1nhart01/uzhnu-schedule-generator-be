"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useGoogleAuthStore } from "@/store/google-auth.store";
import { useTeacherUnavailableStore } from "@/store/teacher-unavailable.store";

const days = ["Понеділок", "Вівторок", "Середа", "Четвер", "Пʼятниця", "Субота"];
const lessonNumbers = [0, 1, 2, 3, 4]; // Можна змінити кількість пар

export default function TeacherUnavailabilityPage() {
  const { getSlots, saveUnavailableState, isLoading, slots } = useTeacherUnavailableStore();

  const transformIntoRecord = slots.reduce<Record<number, number[]>>((accumulator, currentValue) => {
    if (!accumulator[currentValue.day]) {
      accumulator[currentValue.day] = [];
    }
    accumulator[currentValue.day].push(currentValue.lesson_number);
    return accumulator;
  }, {});

  const [unavailable, setUnavailable] = useState<Record<number, number[]>>(transformIntoRecord);
  const { getWhoami, userData } = useGoogleAuthStore();
  const { access_token, refresh_token } = (function () {
    try {
      return JSON.parse(sessionStorage.getItem("USER_DATA") ?? "{ access_token: '', refresh_token: '' }")
    } catch (e) {
      return { access_token: "", refresh_token: "" }
    }
  })()



  useEffect(() => {
    getWhoami().then();
    getSlots(access_token).then();
  }, []);

  useEffect(() => {
    setUnavailable(transformIntoRecord);
  }, [slots])

  const toggleUnavailable = (dayIndex: number, lessonNumber: number) => {
    setUnavailable((prev) => {
      const current = prev[dayIndex] || [];
      const updated = current.includes(lessonNumber)
        ? current.filter((n) => n !== lessonNumber)
        : [...current, lessonNumber];
      return { ...prev, [dayIndex]: updated };
    });
  };

  const handleSave = async () => {
    if (userData) {
    await saveUnavailableState(unavailable, access_token, userData);
    alert("Непридатні години збережено.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Мій недоступний час</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {days.map((day, index) => (
              <div key={day} className="border rounded-lg p-4 bg-muted">
                <h4 className="font-semibold mb-3">{day}</h4>
                <div className="space-y-2">
                  {lessonNumbers.map((lesson) => (
                    <label key={lesson} className="flex items-center gap-2">
                      <Checkbox
                        checked={unavailable[index]?.includes(lesson) || false}
                        onCheckedChange={() =>
                          toggleUnavailable(index, lesson)
                        }
                      />
                      <span>Пара №{lesson + 1}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6">
            <Button onClick={handleSave} className="w-full" disabled={isLoading}>
              {isLoading ? "Збереження..." : "Зберегти"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
