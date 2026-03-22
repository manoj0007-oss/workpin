"use client";

import { LogoWithText } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
    return (
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between h-14 px-4 md:ml-64">
                <div className="md:hidden">
                    <LogoWithText size={24} />
                </div>
                <div className="hidden md:block" />
                <div className="flex items-center gap-2">
                    <LanguageSwitcher />
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
