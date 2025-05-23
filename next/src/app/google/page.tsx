"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function GooglePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const params = searchParams.entries().toArray();

    localStorage.setItem("DALBAYOB", JSON.stringify(params));

    setTimeout(() => {
      router.replace("/teacher");
    }, 1000);
  }, []);

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6 w-full h-full">
      <div>
        <span>Редірект</span>
      </div>
    </div>
  );
}
