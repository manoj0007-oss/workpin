"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    jobId: string;
    workerId: string;
}

export function RateDialog({ open, onOpenChange, jobId, workerId }: RateDialogProps) {
    const { t } = useI18n();
    const [score, setScore] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (score === 0) return;
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from("ratings").insert({
            job_id: jobId,
            rater_id: user.id,
            rated_id: workerId,
            score,
            comment,
        });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success(t("rating_submitted"));
            onOpenChange(false);
            setScore(0);
            setComment("");
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("rate_worker")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>{t("your_rating")}</Label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setScore(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    className="p-1 transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={cn(
                                            "h-8 w-8 transition-colors",
                                            (hover || score) >= star
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-muted-foreground"
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>{t("add_comment")}</Label>
                        <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
                    <Button onClick={handleSubmit} disabled={loading || score === 0}>
                        {t("submit_rating")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
