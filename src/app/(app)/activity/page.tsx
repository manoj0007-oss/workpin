"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, X, User, MessageSquare, IndianRupee, Star } from "lucide-react";
import type { JobRequest, Profile } from "@/lib/types";
import { RateDialog } from "@/components/ratings/rate-dialog";
import { PaymentDialog } from "@/components/payment/payment-dialog";

export default function ActivityPage() {
    const { t } = useI18n();
    const router = useRouter();
    const [requests, setRequests] = useState<JobRequest[]>([]);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [rateJobId, setRateJobId] = useState<string | null>(null);
    const [rateWorkerId, setRateWorkerId] = useState<string | null>(null);
    const [payJobId, setPayJobId] = useState<string | null>(null);
    const [payAmount, setPayAmount] = useState<number>(0);

    const fetchData = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profileData } = await supabase
            .from("profiles").select("*").eq("id", user.id).single();
        if (profileData) setProfile(profileData as Profile);

        if (profileData?.role === "worker") {
            const { data } = await supabase
                .from("requests")
                .select("*, job:jobs(*)")
                .eq("worker_id", user.id)
                .order("created_at", { ascending: false });
            if (data) setRequests(data as JobRequest[]);
        } else {
            // Client: get requests for their jobs
            const { data: jobs } = await supabase
                .from("jobs").select("id").eq("client_id", user.id);
            if (jobs && jobs.length > 0) {
                const jobIds = jobs.map((j) => j.id);
                const { data } = await supabase
                    .from("requests")
                    .select("*, worker:profiles!requests_worker_id_fkey(*), job:jobs(*)")
                    .in("job_id", jobIds)
                    .order("created_at", { ascending: false });
                if (data) setRequests(data as JobRequest[]);
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAccept = async (requestId: string) => {
        const supabase = createClient();
        const { error } = await supabase
            .from("requests")
            .update({ status: "accepted" })
            .eq("id", requestId);
        if (error) {
            toast.error(error.message);
        } else {
            toast.success(t("request_accepted"));
            fetchData();
            // Navigate to chat with this request
            router.push(`/chat/${requestId}`);
        }
    };

    const handleReject = async (requestId: string) => {
        const supabase = createClient();
        const { error } = await supabase
            .from("requests")
            .update({ status: "rejected" })
            .eq("id", requestId);
        if (error) {
            toast.error(error.message);
        } else {
            toast(t("request_rejected"));
            fetchData();
        }
    };

    const handleCompleteJob = async (jobId: string, workerId: string) => {
        const supabase = createClient();
        await supabase.from("jobs").update({ status: "completed" }).eq("id", jobId);
        // Get pay amount from the request's job
        const req = requests.find((r) => r.job_id === jobId && r.worker_id === workerId);
        setPayAmount(Number(req?.job?.pay) || 0);
        setPayJobId(jobId);
        setRateJobId(jobId);
        setRateWorkerId(workerId);
        toast.success(t("job_completed"));
        fetchData();
    };

    const filterByStatus = (status: string) =>
        requests.filter((r) => r.status === status);

    const statusBadge = (status: string) => {
        const colors: Record<string, string> = {
            pending: "bg-yellow-500/10 text-yellow-600",
            accepted: "bg-green-500/10 text-green-600",
            rejected: "bg-red-500/10 text-red-600",
        };
        return <Badge className={colors[status] || ""}>{t(status)}</Badge>;
    };

    const renderRequestCard = (req: JobRequest) => (
        <Card key={req.id} className="border-0 shadow-md">
            <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="font-semibold">{req.job?.title || "Job"}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{req.job?.description}</p>
                    </div>
                    {statusBadge(req.status)}
                </div>

                {req.job?.pay && (
                    <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                        <IndianRupee className="h-3.5 w-3.5" /> {req.job.pay}
                    </div>
                )}

                {/* Show worker info for clients */}
                {profile?.role === "client" && req.worker && (
                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{req.worker.full_name}</p>
                            {req.worker.rating_avg > 0 && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    {req.worker.rating_avg.toFixed(1)}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {req.message && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MessageSquare className="h-4 w-4 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{req.message}</span>
                    </div>
                )}

                {/* Action buttons for clients on pending requests */}
                {profile?.role === "client" && req.status === "pending" && (
                    <div className="flex gap-2 pt-1">
                        <Button size="sm" className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700" onClick={() => handleAccept(req.id)}>
                            <MessageSquare className="h-4 w-4" /> {t("accept_and_chat")}
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => handleReject(req.id)}>
                            <X className="h-4 w-4" /> {t("reject")}
                        </Button>
                    </div>
                )}

                {/* Complete job for clients on accepted requests */}
                {profile?.role === "client" && req.status === "accepted" && req.job?.status !== "completed" && (
                    <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleCompleteJob(req.job_id, req.worker_id)}
                    >
                        {t("complete_job")}
                    </Button>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-xl font-bold mb-4">{t("activity")}</h1>
            <Tabs defaultValue="pending">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pending">{t("tab_pending")}</TabsTrigger>
                    <TabsTrigger value="accepted">{t("tab_accepted")}</TabsTrigger>
                    <TabsTrigger value="rejected">{t("tab_rejected")}</TabsTrigger>
                </TabsList>
                {["pending", "accepted", "rejected"].map((status) => (
                    <TabsContent key={status} value={status} className="space-y-3 mt-4">
                        {filterByStatus(status).length === 0 ? (
                            <p className="text-center text-muted-foreground py-12">{t("no_requests")}</p>
                        ) : (
                            filterByStatus(status).map(renderRequestCard)
                        )}
                    </TabsContent>
                ))}
            </Tabs>

            <RateDialog
                open={!!rateJobId}
                onOpenChange={(open) => { if (!open) { setRateJobId(null); setRateWorkerId(null); } }}
                jobId={rateJobId || ""}
                workerId={rateWorkerId || ""}
            />

            <PaymentDialog
                open={!!payJobId && !rateJobId}
                onOpenChange={(open) => { if (!open) setPayJobId(null); }}
                amount={payAmount}
            />
        </div>
    );
}
