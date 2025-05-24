"use client";

import { login } from "@/api/set_cookies";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CircleUserRound } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function GooglePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const access = searchParams.get("access");
    const refresh = searchParams.get("refresh");

    if (!access || !refresh) {
      router.replace("/");
      return;
    }

    login(access, refresh).then(() => {
      sessionStorage.setItem(
        "USER_DATA",
        JSON.stringify({ access_token: access, refresh_token: refresh }),
      );
      setTimeout(() => {
        router.replace("/teacher");
      }, 1000);
    });
  }, []);

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6 w-full h-full flex flex-row justify-center items-center">
      <div className="">
        <Card className="w-full max-w-sm shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Проходить редірект</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground text-center w-full">
              <CircleUserRound className="w-25 h-25 self-center justify-self-center" />
            </p>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
              Ваш обліковий запис підтверджено!
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
