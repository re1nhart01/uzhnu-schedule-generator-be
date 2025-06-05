"use client";

import { FC, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { getSubjectsByDatesAction } from "@/serverActions/get-subjects-by-date";
import { useFormStatus } from "react-dom";
import { SpinnerCentered } from "../spinner/spinner";
type dateSelectFormProps = {
  availableDates: string[];
  selectedDates: string[];
}


export const DateSelectForm:FC<dateSelectFormProps> = ({ availableDates, selectedDates }) => {
  const [selected, setSelected] = useState<string[]>(selectedDates);
  const { pending } = useFormStatus();
  const toggleDate = (date: string) => {
    setSelected((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  return (
    <>
         <form action={getSubjectsByDatesAction} className="space-y-4">
           <fieldset
             className="space-y-2 overflow-y-auto border rounded-md p-2 max-h-[200px]"
           >
             {availableDates.map((date) => (
               <label key={date} className="flex items-center gap-2">
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

           <Button type="submit" className="w-full">
             Завантажити розклад
           </Button>
         </form>

         {pending && <SpinnerCentered />}
       </>
  );
}
