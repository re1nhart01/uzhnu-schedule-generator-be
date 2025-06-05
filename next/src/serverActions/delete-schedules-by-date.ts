"use server";

import { cookies } from "next/headers";

export async function deleteSchedulesByDatesAction(formData: FormData) {
  const dates = formData.getAll("dates");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/schedule/get-by-dates/?dates=${dates.join(",")}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookies().toString(),
    },
    body: JSON.stringify({ dates }),
  });

  if (!res.ok) {
    throw new Error("Failed to delete schedules");
  }
}
