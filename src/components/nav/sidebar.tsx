"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  badgeKey?: string;
}

const navItems: NavItem[] = [
  { href: "/", labelKey: "nav_map", icon: <Map className="h-5 w-5" /> },
  { href: "/post-job", labelKey: "nav_post_job", icon: <PlusCircle className="h-5 w-5" />, roles: ["client"] },
  { href: "/activity", labelKey: "nav_activity", icon: <Activity className="h-5 w-5" />, badgeKey: "activity" },
  { href: "/chat", labelKey: "nav_chat", icon: <MessageCircle className="h-5 w-5" />, badgeKey: "chat" },
  { href: "/profile", labelKey: "nav_profile", icon: <User className="h-5 w-5" /> },
];

export function Sidebar({ role }: { role?: string }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const router = useRouter();
  const [badges, setBadges] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchBadges = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (role === "client") {
        // Count pending requests on client's jobs
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
        // Count accepted requests (new chat opportunities)
        const { count } = await supabase
          .from("requests")
          .select("id", { count: "exact", head: true })
          .eq("worker_id", user.id)
          .eq("status", "accepted");
        setBadges((prev) => ({ ...prev, chat: count || 0 }));
      }
    };
    fetchBadges();

    // Refresh badges every 15 seconds
    const interval = setInterval(fetchBadges, 15000);
    return () => clearInterval(interval);
  }, [role]);

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
          const badgeCount = item.badgeKey ? badges[item.badgeKey] || 0 : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <span className="relative">
                {item.icon}
                {badgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                    {badgeCount > 9 ? "9+" : badgeCount}
                  </span>
                )}
              </span>
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
