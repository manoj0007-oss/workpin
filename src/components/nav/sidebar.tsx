"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { Map, Activity, MessageCircle, User, PlusCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoWithText } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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

export function Sidebar({ role }: { role?: string }) {
    const pathname = usePathname();
    const { t } = useI18n();
    const router = useRouter();

    const filteredItems = navItems.filter(
        (item) => !item.roles || (role && item.roles.includes(role as "worker" | "client"))
    );

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 border-r bg-background z-30">
            <div className="flex items-center h-14 px-6 border-b">
                <LogoWithText size={28} />
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
                {filteredItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                        >
                            {item.icon}
                            {t(item.labelKey)}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-3 border-t">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-muted-foreground"
                    onClick={handleSignOut}
                >
                    <LogOut className="h-5 w-5" />
                    {t("sign_out")}
                </Button>
            </div>
        </aside>
    );
}
