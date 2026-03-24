"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Banknote, Smartphone, CheckCircle2, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";

const UPI_ID = "9985686668-3@ybl";
const UPI_NAME = "Workpin";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount?: number;
}

export function PaymentDialog({ open, onOpenChange, amount }: PaymentDialogProps) {
  const { t } = useI18n();
  const [method, setMethod] = useState<"upi" | "cash" | "">("");
  const [paid, setPaid] = useState(false);
  const [payAmount, setPayAmount] = useState(amount || 0);

  const handlePay = () => {
    if (method === "upi") {
      // Build UPI deep link
      const upiUrl = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_NAME)}&am=${payAmount}&cu=INR&tn=${encodeURIComponent("Workpin Job Payment")}`;
      window.open(upiUrl, "_blank");
      // Mark as paid after redirect
      setTimeout(() => {
        setPaid(true);
        toast.success(t("payment_success"));
        setTimeout(() => {
          onOpenChange(false);
          setPaid(false);
          setMethod("");
        }, 1500);
      }, 2000);
    } else {
      // Cash - just mark as paid
      setPaid(true);
      toast.success(t("payment_success"));
      setTimeout(() => {
        onOpenChange(false);
        setPaid(false);
        setMethod("");
      }, 1500);
    }
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
            {/* Amount */}
            <div className="space-y-2">
              <Label>{t("pay")}</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={payAmount || ""}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="pl-9 text-lg font-bold"
                  min={1}
                />
              </div>
            </div>

            {/* Method selection */}
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
              <Button onClick={handlePay} disabled={!method || payAmount <= 0} className="w-full gap-2">
                {method === "upi" && <Smartphone className="h-4 w-4" />}
                {t("pay_now")} {payAmount > 0 && `₹${payAmount}`}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
