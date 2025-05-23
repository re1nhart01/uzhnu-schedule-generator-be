"use client";

import { HEADER_HEIGHT } from "@/constants/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FC, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle/theme-toggle";
import { useGoogleAuthStore } from "@/store/google-auth.store";
import { useRouter } from "next/navigation";

type headerProps = object;

export const Header: FC<headerProps> = () => {
  const [lang, setLang] = useState("uk");
  const { userData } = useGoogleAuthStore(); // припускаємо, що є функція logout
  const router = useRouter();

  const handleLogout = () => {
    // logout?.(); // або очищення localStorage / token
    router.push("/login");
  };

  return (
    <header
      className={`bg-background border-b px-6 py-4 flex items-center justify-between h-[${HEADER_HEIGHT}px]`}
    >
      <div className="flex flex-row items-center gap-8">
        <Link href="/" className="text-xl font-bold text-foreground">
          Розклад
        </Link>
        <Link
          href="/auth/teacher"
          className="hover:underline text-sm text-muted-foreground"
        >
          Вхід для викладача
        </Link>
        <Link
          href="/auth/admin"
          className="hover:underline text-sm text-muted-foreground"
        >
          Вхід для адміністратора
        </Link>
        <Link
          href="/about"
          className="hover:underline text-sm text-muted-foreground"
        >
          Про додаток
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Select value={lang} onValueChange={setLang}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Мова" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="uk">Українська</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>

        <ThemeToggle />

        {userData && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer w-10 h-10">
                <AvatarImage
                  className="rounded-full w-10 h-10"
                  src={userData?.image_url}
                  alt="user avatar"
                />
                <AvatarFallback>
                  {userData.first_name[0]}
                  {userData.last_name[0]}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-4 py-2 text-sm font-medium">
                {userData.first_name} {userData.last_name}
              </div>
              <DropdownMenuItem onClick={handleLogout}>
                Вийти з акаунту
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};
