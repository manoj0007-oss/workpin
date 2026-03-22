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
import { LogIn } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { t } = useI18n();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            toast.error(error.message);
            setLoading(false);
        } else {
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
                    <CardTitle className="text-2xl font-bold">{t("login")}</CardTitle>
                    <CardDescription>{t("tagline")}</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
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
                                autoComplete="current-password"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full gap-2" disabled={loading}>
                            <LogIn className="h-4 w-4" />
                            {loading ? t("signing_in") : t("login")}
                        </Button>
                        <p className="text-sm text-muted-foreground text-center">
                            {t("no_account")}{" "}
                            <Link href="/signup" className="text-primary font-medium hover:underline">
                                {t("signup")}
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </>
    );
}
