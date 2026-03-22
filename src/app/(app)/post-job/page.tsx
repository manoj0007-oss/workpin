"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const categories = ["electrical", "plumbing", "cleaning", "delivery", "carpenter", "general"];

export default function PostJobPage() {
    const { t } = useI18n();
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [pay, setPay] = useState("");
    const [category, setCategory] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get user location
        const { data: profile } = await supabase
            .from("profiles")
            .select("lat, lng")
            .eq("id", user.id)
            .single();

        if (!profile?.lat || !profile?.lng) {
            toast.error("Please set your location first");
            setLoading(false);
            router.push("/");
            return;
        }

        const { error } = await supabase.from("jobs").insert({
            client_id: user.id,
            title,
            description,
            pay,
            category,
            lat: profile.lat,
            lng: profile.lng,
        });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success(t("create_job") + " ✓");
            setTitle("");
            setDescription("");
            setPay("");
            setCategory("");
            router.push("/activity");
        }
        setLoading(false);
    };

    return (
        <div className="max-w-lg mx-auto p-4">
            <Card className="border-0 shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PlusCircle className="h-5 w-5 text-primary" />
                        {t("post_new_job")}
                    </CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">{t("title")}</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">{t("description")}</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pay">{t("pay")}</Label>
                            <Input
                                id="pay"
                                value={pay}
                                onChange={(e) => setPay(e.target.value)}
                                placeholder="₹500"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("category")}</Label>
                            <Select value={category} onValueChange={(v) => setCategory(v || "")} required>
                                <SelectTrigger>
                                    <SelectValue placeholder={t("category")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {t(`cat_${cat}`)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" className="w-full gap-2" disabled={loading || !category}>
                            <PlusCircle className="h-4 w-4" />
                            {loading ? t("creating_job") : t("create_job")}
                        </Button>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}
