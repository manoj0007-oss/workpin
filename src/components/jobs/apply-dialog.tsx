"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Send } from "lucide-react";

interface ApplyDialogProps {
    jobId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ApplyDialog({ jobId, open, onOpenChange }: ApplyDialogProps) {
    const { t } = useI18n();
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleApply = async () => {
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from("requests").insert({
            job_id: jobId,
            worker_id: user.id,
            message,
        });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success(t("request_sent"));
            onOpenChange(false);
            setMessage("");
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("get_this_job")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>{t("apply_message")}</Label>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                            placeholder={t("apply_message")}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
                    <Button onClick={handleApply} disabled={loading} className="gap-2">
                        <Send className="h-4 w-4" />
                        {t("send_request")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
