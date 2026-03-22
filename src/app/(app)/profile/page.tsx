"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { User, Star, Phone, LogOut, Calendar, Briefcase, CheckCircle2 } from "lucide-react";
import type { Profile } from "@/lib/types";

export default function ProfilePage() {
    const { t } = useI18n();
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [editing, setEditing] = useState(false);
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [jobCount, setJobCount] = useState(0);

    useEffect(() => {
        const fetchProfile = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("profiles").select("*").eq("id", user.id).single();
            if (data) {
                const p = data as Profile;
                setProfile(p);
                setFullName(p.full_name);
                setPhone(p.phone);

                // Count jobs
                if (p.role === "client") {
                    const { count } = await supabase
                        .from("jobs").select("id", { count: "exact", head: true }).eq("client_id", user.id);
                    setJobCount(count || 0);
                } else {
                    const { count } = await supabase
                        .from("requests").select("id", { count: "exact", head: true })
                        .eq("worker_id", user.id).eq("status", "accepted");
                    setJobCount(count || 0);
                }
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        if (!profile) return;
        const supabase = createClient();
        await supabase.from("profiles").update({ full_name: fullName, phone }).eq("id", profile.id);
        setProfile({ ...profile, full_name: fullName, phone });
        setEditing(false);
        toast.success(t("save") + " ✓");
    };

    const toggleAvailability = async () => {
        if (!profile) return;
        const supabase = createClient();
        const newVal = !profile.is_available;
        await supabase.from("profiles").update({ is_available: newVal }).eq("id", profile.id);
        setProfile({ ...profile, is_available: newVal });
        toast(newVal ? t("available") : t("not_available"));
    };

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
    };

    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto p-4 space-y-4">
            <h1 className="text-xl font-bold">{t("profile")}</h1>

            {/* Profile Card */}
            <Card className="border-0 shadow-xl">
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-3">
                            <User className="h-10 w-10 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold">{profile.full_name}</h2>
                        <Badge variant="secondary" className="mt-1 capitalize">
                            {t(profile.role)}
                        </Badge>

                        <div className="flex items-center gap-6 mt-4">
                            {profile.rating_avg > 0 && (
                                <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-semibold">{profile.rating_avg.toFixed(1)}</span>
                                    <span className="text-xs text-muted-foreground">({profile.rating_count})</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Briefcase className="h-4 w-4" />
                                <span>{jobCount} {profile.role === "client" ? t("jobs_posted") : t("jobs_completed")}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                            <Calendar className="h-3 w-3" />
                            {t("member_since")} {new Date(profile.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Availability toggle (workers only) */}
            {profile.role === "worker" && (
                <Card className="border-0 shadow-md">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className={`h-5 w-5 ${profile.is_available ? "text-green-500" : "text-muted-foreground"}`} />
                            <div>
                                <Label className="font-medium">{t("status")}</Label>
                                <p className="text-sm text-muted-foreground">
                                    {profile.is_available ? t("available") : t("not_available")}
                                </p>
                            </div>
                        </div>
                        <Switch checked={profile.is_available} onCheckedChange={toggleAvailability} />
                    </CardContent>
                </Card>
            )}

            {/* Edit Profile */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <CardTitle className="text-base">{t("edit_profile")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>{t("full_name")}</Label>
                        <Input
                            value={fullName}
                            onChange={(e) => { setFullName(e.target.value); setEditing(true); }}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>{t("phone")}</Label>
                        <Input
                            value={phone}
                            onChange={(e) => { setPhone(e.target.value); setEditing(true); }}
                        />
                    </div>
                    {editing && (
                        <Button onClick={handleSave} className="w-full">{t("save")}</Button>
                    )}
                </CardContent>
            </Card>

            {/* Sign Out */}
            <Button
                variant="outline"
                className="w-full gap-2 text-destructive hover:text-destructive"
                onClick={handleSignOut}
            >
                <LogOut className="h-4 w-4" />
                {t("sign_out")}
            </Button>
        </div>
    );
}
