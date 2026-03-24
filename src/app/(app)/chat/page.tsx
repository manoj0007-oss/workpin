"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, User } from "lucide-react";
import Link from "next/link";
import type { JobRequest } from "@/lib/types";

export default function ChatListPage() {
  const { t } = useI18n();
  const [chats, setChats] = useState<JobRequest[]>([]);
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const fetchChats = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles").select("role").eq("id", user.id).single();

      const userRole = profile?.role || "";
      setRole(userRole);

      if (userRole === "worker") {
        const { data } = await supabase
          .from("requests")
          .select("*, job:jobs(*, client:profiles!jobs_client_id_fkey(full_name))")
          .eq("worker_id", user.id)
          .eq("status", "accepted")
          .order("updated_at", { ascending: false });
        if (data) setChats(data as JobRequest[]);
      } else {
        const { data: jobs } = await supabase
          .from("jobs").select("id").eq("client_id", user.id);
        if (jobs && jobs.length > 0) {
          const { data } = await supabase
            .from("requests")
            .select("*, worker:profiles!requests_worker_id_fkey(*), job:jobs(*)")
            .in("job_id", jobs.map((j) => j.id))
            .eq("status", "accepted")
            .order("updated_at", { ascending: false });
          if (data) setChats(data as JobRequest[]);
        }
      }
    };
    fetchChats();
  }, []);

  const getChatName = (chat: JobRequest) => {
    if (role === "client") {
      // Client sees: Worker Name
      return chat.worker?.full_name || "Worker";
    } else {
      // Worker sees: Client Name (Job Title)
      const clientName = (chat.job as any)?.client?.full_name || "Client";
      const jobTitle = chat.job?.title || "";
      return jobTitle ? `${clientName} (${jobTitle})` : clientName;
    }
  };

  const getSubtext = (chat: JobRequest) => {
    if (role === "client") {
      return chat.job?.title || "";
    }
    return chat.job?.category || "";
  };

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <MessageCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">{t("no_chats")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-3">
      <h1 className="text-xl font-bold mb-4">{t("chat")}</h1>
      {chats.map((chat) => (
        <Link key={chat.id} href={`/chat/${chat.id}`}>
          <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer mb-3">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{getChatName(chat)}</p>
                <p className="text-sm text-muted-foreground truncate">{getSubtext(chat)}</p>
              </div>
              <MessageCircle className="h-5 w-5 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
