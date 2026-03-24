"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.replace("/");
        return;
      }
      setChecking(false);
    };
    checkAuth();
  }, [router]);

  if (checking) {
    return (
      <div className="h-[100dvh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mb-3 flex flex-col items-center gap-1">
        <Logo size={48} />
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Work<span className="text-primary">pin</span>
          </h1>
          <p className="text-xs text-muted-foreground">Find work. Hire help. Nearby.</p>
        </div>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
