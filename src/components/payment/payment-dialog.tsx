"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Banknote, Smartphone, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PaymentDialog({ open, onOpenChange }: PaymentDialogProps) {
    const { t } = useI18n();
    const [method, setMethod] = useState<"upi" | "cash" | "">("");
    const [paid, setPaid] = useState(false);

    const handlePay = () => {
        // Mock payment
        setTimeout(() => {
            setPaid(true);
            toast.success(t("payment_success"));
            setTimeout(() => {
                onOpenChange(false);
                setPaid(false);
                setMethod("");
            }, 1500);
        }, 1000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("payment")}</DialogTitle>
                </DialogHeader>

                {paid ? (
                    <div className="flex flex-col items-center py-8 gap-3">
                        <CheckCircle2 className="h-16 w-16 text-green-500" />
                        <p className="font-semibold text-lg">{t("payment_success")}</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">{t("payment_method")}</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setMethod("upi")}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                                        method === "upi"
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/50"
                                    )}
                                >
                                    <Smartphone className={cn("h-8 w-8", method === "upi" ? "text-primary" : "text-muted-foreground")} />
                                    <span className="font-medium">{t("upi")}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMethod("cash")}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                                        method === "cash"
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/50"
                                    )}
                                >
                                    <Banknote className={cn("h-8 w-8", method === "cash" ? "text-primary" : "text-muted-foreground")} />
                                    <span className="font-medium">{t("cash")}</span>
                                </button>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handlePay} disabled={!method} className="w-full">
                                {t("pay_now")}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
