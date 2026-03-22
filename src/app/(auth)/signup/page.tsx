"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LanguageSwitcher } from "@/components/language-switcher";
import { toast } from "sonner";
import { UserPlus, Briefcase, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState<"worker" | "client" | "">("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { t } = useI18n();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role) {
            toast.error("Please select a role");
            return;
        }
        setLoading(true);
        const supabase = createClient();
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role,
                    full_name: fullName,
                    phone,
                },
            },
        });
        if (error) {
            toast.error(error.message);
            setLoading(false);
        } else {
            toast.success("Account created!");
            router.push("/");
            router.refresh();
        }
    };

    return (
        <>
            <div className="flex justify-center mb-6">
                <LanguageSwitcher />
            </div>
            <Card className="border-0 shadow-xl bg-card/80 backdrop-blur">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">{t("signup")}</CardTitle>
                    <CardDescription>{t("tagline")}</CardDescription>
                </CardHeader>
                <form onSubmit={handleSignup}>
                    <CardContent className="space-y-4">
                        {/* Role Selection */}
                        <div className="space-y-2">
                            <Label>{t("role_select")}</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole("worker")}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                                        role === "worker"
                                            ? "border-primary bg-primary/5 shadow-md"
                                            : "border-border hover:border-primary/50"
                                    )}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                                        role === "worker" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                    )}>
                                        <Wrench className="h-6 w-6" />
                                    </div>
                                    <span className="font-semibold text-sm">{t("role_worker")}</span>
                                    <span className="text-xs text-muted-foreground text-center">{t("role_worker_desc")}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole("client")}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                                        role === "client"
                                            ? "border-primary bg-primary/5 shadow-md"
                                            : "border-border hover:border-primary/50"
                                    )}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                                        role === "client" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                    )}>
                                        <Briefcase className="h-6 w-6" />
                                    </div>
                                    <span className="font-semibold text-sm">{t("role_client")}</span>
                                    <span className="text-xs text-muted-foreground text-center">{t("role_client_desc")}</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fullName">{t("full_name")}</Label>
                            <Input
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">{t("phone")}</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">{t("email")}</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                autoComplete="email"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">{t("password")}</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                                autoComplete="new-password"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full gap-2" disabled={loading || !role}>
                            <UserPlus className="h-4 w-4" />
                            {loading ? t("signing_up") : t("signup")}
                        </Button>
                        <p className="text-sm text-muted-foreground text-center">
                            {t("have_account")}{" "}
                            <Link href="/login" className="text-primary font-medium hover:underline">
                                {t("login")}
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </>
    );
}
