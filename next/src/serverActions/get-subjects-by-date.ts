"use server";

import { redirect } from "next/navigation";

export async function getSubjectsByDatesAction(formData: FormData) {
  const selectedDates = formData.getAll("dates") as string[];
  const search = selectedDates.join(",");

  redirect(`/?dates=${encodeURIComponent(search)}`);
}


export async function getSubjectsByDatesAdminAction(formData: FormData) {
  const selectedDates = formData.getAll("dates") as string[];
  const search = selectedDates.join(",");

  redirect(`/admin/watch-and-delete/?dates=${encodeURIComponent(search)}`);
}
