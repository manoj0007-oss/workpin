"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/nav/header";
import { BottomNav } from "@/components/nav/bottom-nav";
import { Sidebar } from "@/components/nav/sidebar";
import type { Profile } from "@/lib/types";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();
                if (data) setProfile(data as Profile);
            }
        };
        fetchProfile();
    }, []);

    return (
        <div className="min-h-screen">
            <Sidebar role={profile?.role} />
            <Header />
            <main className="md:ml-64 pb-20 md:pb-4">
                {children}
            </main>
            <BottomNav role={profile?.role} />
        </div>
    );
}
