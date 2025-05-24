"use client";

import { useState } from "react";
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

const groups = ["КН-31", "КН-32", "КН-33"];
const days = [
  "Понеділок",
  "Вівторок",
  "Середа",
  "Четвер",
  "Пʼятниця",
  "Субота",
];

export default function ScheduleConfigPage() {
  const [selectedGroup, setSelectedGroup] = useState(groups[0]);
  const [subjectCount, setSubjectCount] = useState(1);
  const [selectedDays, setSelectedDays] = useState<string[]>([...days]);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleGenerate = () => {
    alert(
      `Група: ${selectedGroup}\nПари на тиждень: ${subjectCount}\nДні: ${selectedDays.join(", ")}`,
    );
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-6 min-h-[87vh]">
      <Card>
        <CardHeader>
          <CardTitle>Налаштування розкладу</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Оберіть групу</Label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Група" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Кількість занять одного предмета на тиждень</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={subjectCount}
              onChange={(e) => setSubjectCount(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label>Дні тижня</Label>
            <div className="grid grid-cols-2 gap-2">
              {days.map((day) => (
                <label key={day} className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedDays.includes(day)}
                    onCheckedChange={() => toggleDay(day)}
                  />
                  <span>{day}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={handleGenerate} className="w-full">
              Згенерувати розклад
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
