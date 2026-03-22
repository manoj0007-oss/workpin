"use client";

import { useI18n, type Locale } from "@/lib/i18n/context";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

const languages: { code: Locale; label: string }[] = [
    { code: "en", label: "English" },
    { code: "te", label: "తెలుగు" },
    { code: "hi", label: "हिन्दी" },
    { code: "ta", label: "தமிழ்" },
];

export function LanguageSwitcher() {
    const { locale, setLocale } = useI18n();
    const current = languages.find((l) => l.code === locale) || languages[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded-md bg-background hover:bg-accent transition-colors cursor-pointer"
            >
                <Globe className="h-4 w-4" />
                <span>{current.label}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[150px]">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setLocale(lang.code)}
                        className={`text-sm font-medium cursor-pointer ${locale === lang.code ? "bg-accent" : ""}`}
                    >
                        {lang.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
