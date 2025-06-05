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
import { FC, useEffect, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle/theme-toggle";
import { useGoogleAuthStore } from "@/store/google-auth.store";
import { usePathname, useRouter } from "next/navigation";
import { useUserCredentials } from "@/hooks/useUserCredentials";
import { logout } from "@/api/remove_cookies";
import { useTheme } from "next-themes";
import { LogOut, ShieldCheck } from "lucide-react";

type headerProps = object;

export const Header: FC<headerProps> = () => {
  const [lang, setLang] = useState("uk");
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { userData, setNullUserData } = useGoogleAuthStore();
  const { removeItems } = useUserCredentials();
  const router = useRouter();

  const [hasAdminSession, setHasAdminSession] = useState(false);

  useEffect(() => {
    const cookies = document.cookie;
    const hasCsrf = cookies.includes("csrftoken=");
    setHasAdminSession(hasCsrf);
  }, [pathname]);

  const handleLogoutUser = async () => {
    await logout();
    removeItems();
    setNullUserData();
    router.push("/");
  };

  const handleLogoutAdmin = async () => {
    try {
      await fetch("/api/django_admin_logout", {
        method: "POST",
        credentials: "include",
      });
      location.reload();
    } catch (e) {
      console.error("Logout admin error", e);
    }
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
              <DropdownMenuItem onClick={handleLogoutUser}>
                <LogOut className="mr-2 h-4 w-4" />
                Вийти з акаунту
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {hasAdminSession && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer w-10 h-10 border-2 border-yellow-500 bg-yellow-100">
                <ShieldCheck className="w-5 h-5 text-yellow-600" />
                <AvatarFallback>ADM</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-4 py-2 text-sm font-medium text-yellow-700">
                Адміністративний вхід
              </div>
              <DropdownMenuItem onClick={handleLogoutAdmin}>
                <LogOut className="mr-2 h-4 w-4" />
                Вийти з адмінки
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};
