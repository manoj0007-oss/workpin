"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { Map, Activity, MessageCircle, User, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ReactNode;
  roles?: ("worker" | "client")[];
  badgeKey?: string;
}

const navItems: NavItem[] = [
  { href: "/", labelKey: "nav_map", icon: <Map className="h-5 w-5" /> },
  { href: "/post-job", labelKey: "nav_post_job", icon: <PlusCircle className="h-5 w-5" />, roles: ["client"] },
  { href: "/activity", labelKey: "nav_activity", icon: <Activity className="h-5 w-5" />, badgeKey: "activity" },
  { href: "/chat", labelKey: "nav_chat", icon: <MessageCircle className="h-5 w-5" />, badgeKey: "chat" },
  { href: "/profile", labelKey: "nav_profile", icon: <User className="h-5 w-5" /> },
];

export function BottomNav({ role }: { role?: string }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const [badges, setBadges] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchBadges = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (role === "client") {
        const { data: jobs } = await supabase
          .from("jobs").select("id").eq("client_id", user.id);
        if (jobs && jobs.length > 0) {
          const { count } = await supabase
            .from("requests")
            .select("id", { count: "exact", head: true })
            .in("job_id", jobs.map((j) => j.id))
            .eq("status", "pending");
          setBadges((prev) => ({ ...prev, activity: count || 0 }));
        }
      } else if (role === "worker") {
        const { count } = await supabase
          .from("requests")
          .select("id", { count: "exact", head: true })
          .eq("worker_id", user.id)
          .eq("status", "accepted");
        setBadges((prev) => ({ ...prev, chat: count || 0 }));
      }
    };
    fetchBadges();
    const interval = setInterval(fetchBadges, 15000);
    return () => clearInterval(interval);
  }, [role]);

  const filteredItems = navItems.filter(
    (item) => !item.roles || (role && item.roles.includes(role as "worker" | "client"))
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          const badgeCount = item.badgeKey ? badges[item.badgeKey] || 0 : 0;
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
              <span className="relative">
                {item.icon}
                {badgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 animate-pulse">
                    {badgeCount > 9 ? "9+" : badgeCount}
                  </span>
                )}
              </span>
              <span className="truncate">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
