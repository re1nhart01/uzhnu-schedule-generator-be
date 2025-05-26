"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useGoogleAuthStore } from "@/store/google-auth.store";

const days = [
  "Понеділок",
  "Вівторок",
  "Середа",
  "Четвер",
  "Пʼятниця",
  "Субота",
];
const hours = [
  "8:00 - 9:30",
  "9:45 - 11:15",
  "11:30 - 13:00",
  "13:15 - 14:45",
  "15:00 - 16:30",
];

export default function TeacherUnavailabilityPage() {
  const [unavailable, setUnavailable] = useState<Record<string, string[]>>({});
  const { getWhoami } = useGoogleAuthStore();

  const toggleUnavailable = (day: string, hour: string) => {
    setUnavailable((prev) => {
      const current = prev[day] || [];
      return {
        ...prev,
        [day]: current.includes(hour)
          ? current.filter((h) => h !== hour)
          : [...current, hour],
      };
    });
  };

  useEffect(() => {
    getWhoami().then();
  }, []);

  const handleSave = () => {
    console.log("Unavailable slots:", unavailable);
    alert("Непридатні години збережено (поки в консолі)");
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Мій недоступний час</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {days.map((day) => (
              <div key={day} className="border rounded-lg p-4 bg-muted">
                <h4 className="font-semibold mb-2">{day}</h4>
                <div className="space-y-2">
                  {hours.map((hour) => (
                    <label key={hour} className="flex items-center gap-2">
                      <Checkbox
                        checked={unavailable[day]?.includes(hour) || false}
                        onCheckedChange={() => toggleUnavailable(day, hour)}
                      />
                      <span>{hour}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6">
            <Button onClick={handleSave} className="w-full">
              Зберегти
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
