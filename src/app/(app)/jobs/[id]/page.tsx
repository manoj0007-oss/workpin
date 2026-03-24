"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ApplyDialog } from "@/components/jobs/apply-dialog";
import { ArrowLeft, IndianRupee, Phone, Star, User, Pencil, Check } from "lucide-react";
import { toast } from "sonner";
import type { Job, Profile } from "@/lib/types";

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const [job, setJob] = useState<Job | null>(null);
  const [client, setClient] = useState<Profile | null>(null);
  const [showApply, setShowApply] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [editingFare, setEditingFare] = useState(false);
  const [newFare, setNewFare] = useState<number>(0);

  useEffect(() => {
    const fetchJob = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile) setUserRole(profile.role);

        // Check if already applied
        const { data: existing } = await supabase
          .from("requests")
          .select("id")
          .eq("job_id", id as string)
          .eq("worker_id", user.id)
          .limit(1);
        if (existing && existing.length > 0) setAlreadyApplied(true);
      }

      const { data } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id as string)
        .single();

      if (data) {
        setJob(data as Job);
        setNewFare(Number((data as Job).pay) || 0);
        const { data: clientData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", (data as Job).client_id)
          .single();
        if (clientData) setClient(clientData as Profile);
      }
    };
    fetchJob();
  }, [id]);

  const handleUpdateFare = async () => {
    if (!job || newFare <= 0) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("jobs")
      .update({ pay: String(newFare) })
      .eq("id", job.id);
    if (error) {
      toast.error(error.message);
    } else {
      setJob({ ...job, pay: String(newFare) });
      setEditingFare(false);
      toast.success(t("save") + " ✓");
    }
  };

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const catKey = `cat_${job.category}` as string;
  const isOwner = userRole === "client" && userId === job.client_id;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <Button variant="ghost" onClick={() => router.back()} className="gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" />
        {t("nav_map")}
      </Button>

      <Card className="border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl">{job.title}</CardTitle>
            <Badge variant="secondary">{t(catKey)}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{job.description}</p>

          {/* Fare display / edit */}
          <div className="flex items-center gap-2">
            {editingFare ? (
              <div className="flex items-center gap-2 flex-1">
                <IndianRupee className="h-5 w-5 text-primary" />
                <Input
                  type="number"
                  value={newFare || ""}
                  onChange={(e) => setNewFare(Number(e.target.value))}
                  className="w-32 text-lg font-bold"
                  min={1}
                  autoFocus
                />
                <Button size="sm" onClick={handleUpdateFare} className="gap-1">
                  <Check className="h-4 w-4" /> {t("save")}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditingFare(false); setNewFare(Number(job.pay) || 0); }}>
                  {t("cancel")}
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-lg font-bold text-primary">
                  <IndianRupee className="h-5 w-5" />
                  {job.pay}
                </div>
                {isOwner && (
                  <Button size="sm" variant="ghost" onClick={() => setEditingFare(true)} className="gap-1 text-muted-foreground">
                    <Pencil className="h-3.5 w-3.5" /> {t("edit_profile")}
                  </Button>
                )}
              </>
            )}
          </div>

          <Separator />

          {/* Client info */}
          {client && (
            <div className="space-y-3">
              <h3 className="font-semibold">{t("client_info")}</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{client.full_name}</p>
                  {client.rating_avg > 0 && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      {client.rating_avg.toFixed(1)} ({client.rating_count} {t("stars")})
                    </p>
                  )}
                </div>
              </div>

              {client.phone && (
                <a
                  href={`tel:${client.phone}`}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Phone className="h-4 w-4" />
                  {client.phone} — {t("call_now")}
                </a>
              )}
            </div>
          )}

          <Separator />

          {/* Apply button (workers only) */}
          {userRole === "worker" && job.status === "open" && (
            <Button
              className="w-full gap-2 text-base py-6"
              size="lg"
              onClick={() => setShowApply(true)}
              disabled={alreadyApplied}
            >
              {alreadyApplied ? t("pending") : t("get_this_job")}
            </Button>
          )}
        </CardContent>
      </Card>

      <ApplyDialog
        jobId={job.id}
        open={showApply}
        onOpenChange={setShowApply}
      />
    </div>
  );
}
