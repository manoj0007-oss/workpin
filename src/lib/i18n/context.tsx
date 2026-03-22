"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import en from "@/locales/en.json";
import te from "@/locales/te.json";
import hi from "@/locales/hi.json";
import ta from "@/locales/ta.json";

export type Locale = "en" | "te" | "hi" | "ta";

type Translations = Record<string, string>;

const translations: Record<Locale, Translations> = { en, te, hi, ta };

interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
    locale: "en",
    setLocale: () => { },
    t: (key: string) => key,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>("en");

    useEffect(() => {
        const saved = localStorage.getItem("workpin-locale") as Locale | null;
        if (saved && translations[saved]) {
            setLocaleState(saved);
        }
    }, []);

    const setLocale = useCallback((l: Locale) => {
        setLocaleState(l);
        localStorage.setItem("workpin-locale", l);
    }, []);

    const t = useCallback(
        (key: string) => translations[locale]?.[key] || translations.en[key] || key,
        [locale]
    );

    return (
        <I18nContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    return useContext(I18nContext);
}
