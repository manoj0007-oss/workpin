"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { Map, Activity, MessageCircle, User, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
    href: string;
    labelKey: string;
    icon: React.ReactNode;
    roles?: ("worker" | "client")[];
}

const navItems: NavItem[] = [
    { href: "/", labelKey: "nav_map", icon: <Map className="h-5 w-5" /> },
    { href: "/post-job", labelKey: "nav_post_job", icon: <PlusCircle className="h-5 w-5" />, roles: ["client"] },
    { href: "/activity", labelKey: "nav_activity", icon: <Activity className="h-5 w-5" /> },
    { href: "/chat", labelKey: "nav_chat", icon: <MessageCircle className="h-5 w-5" /> },
    { href: "/profile", labelKey: "nav_profile", icon: <User className="h-5 w-5" /> },
];

export function BottomNav({ role }: { role?: string }) {
    const pathname = usePathname();
    const { t } = useI18n();

    const filteredItems = navItems.filter(
        (item) => !item.roles || (role && item.roles.includes(role as "worker" | "client"))
    );

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
            <div className="flex items-center justify-around h-16 px-2">
                {filteredItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 flex-1 h-full text-xs font-medium transition-colors",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {item.icon}
                            <span className="truncate">{t(item.labelKey)}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
