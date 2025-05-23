'use client'

import { HEADER_HEIGHT } from "@/constants/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {FC, useState} from "react";
import Link from "next/link";
import {ThemeToggle} from "@/components/theme-toggle/theme-toggle";


type headerProps = object;

export const Header: FC<headerProps> = () => {
    const [lang, setLang] = useState('uk')

    return (
        <header className={`bg-background border-b px-6 py-4 flex items-center justify-between h-[${HEADER_HEIGHT}px]`}>
      <div className="flex flex-row items-center gap-8">
        <Link href="/" className="text-xl font-bold text-foreground">Розклад</Link>
        <Link href="/about" className="hover:underline text-sm text-muted-foreground">Вхід для викладача</Link>
        <Link href="/about" className="hover:underline text-sm text-muted-foreground">Вхід для адміністратора</Link>
        <Link href="/about" className="hover:underline text-sm text-muted-foreground">Про додаток</Link>
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
      </div>
    </header>
    )
}
