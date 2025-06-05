"use client";

import { FC, useState, useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { getSubjectsByDatesAction, getSubjectsByDatesAdminAction } from "@/serverActions/get-subjects-by-date";
import { useFormStatus } from "react-dom";
import { SpinnerCentered } from "../spinner/spinner";

type DateSelectFormProps = {
  availableDates: string[];
  selectedDates: string[];
};

export const DateDeleteForm: FC<DateSelectFormProps> = ({
  availableDates,
  selectedDates,
}) => {
  const [selected, setSelected] = useState<string[]>(selectedDates);
  const { pending } = useFormStatus();
  const [deleting, startDelete] = useTransition();

  const toggleDate = (date: string) => {
    setSelected((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const handleDelete = () => {
    if (selected.length === 0) return;

    startDelete(async () => {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}api/schedule/get-by-dates/?dates=${selected.join(",")}`,
          {
            method: "DELETE",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        location.reload(); // оновити сторінку
      } catch (e) {
        console.error("Помилка при видаленні розкладу", e);
      }
    });
  };

  return (
    <div className="space-y-4">
          <form action={getSubjectsByDatesAdminAction} className="space-y-4">
            <fieldset
              className="space-y-2 overflow-y-auto border rounded-md p-2"
              style={{ maxHeight: "200px" }}
            >
              {availableDates.map((date, index) => (
                <label key={`${date}${index}`} className="flex items-center gap-2">
                  <Checkbox
                    name="dates"
                    value={date}
                    checked={selected.includes(date)}
                    onCheckedChange={() => toggleDate(date)}
                  />
                  <span>{date}</span>
                </label>
              ))}
            </fieldset>

            <div className="flex gap-2 flex-wrap mt-2">
              <Button type="submit" disabled={pending}>
                Завантажити розклад
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting || selected.length === 0}
              >
                {deleting ? "Видалення..." : "Видалити вибрані"}
              </Button>
            </div>
          </form>

          {pending || deleting ? <SpinnerCentered /> : null}
        </div>
  );
};
