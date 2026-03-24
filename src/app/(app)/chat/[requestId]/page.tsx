"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, User, Star, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import type { Message, Profile } from "@/lib/types";

export default function ChatRoomPage() {
  const { requestId } = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [chatTitle, setChatTitle] = useState("");
  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const init = async () => {
      const supabase = supabaseRef.current;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles").select("role").eq("id", user.id).single();

      // Get request info with both worker and job (with client)
      const { data: req } = await supabase
        .from("requests")
        .select("*, job:jobs(*, client:profiles!jobs_client_id_fkey(*)), worker:profiles!requests_worker_id_fkey(*)")
        .eq("id", requestId as string)
        .single();

      if (req) {
        const r = req as any;
        setJobTitle(r.job?.title || "");

        if (profile?.role === "client") {
          // Client sees worker name
          setChatTitle(r.worker?.full_name || "Worker");
          setOtherUser(r.worker as Profile);
        } else {
          // Worker sees client name (job title)
          const clientName = r.job?.client?.full_name || "Client";
          setChatTitle(r.job?.title ? `${clientName} (${r.job.title})` : clientName);
          setOtherUser(r.job?.client as Profile);
        }
      }

      // Fetch existing messages
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("request_id", requestId as string)
        .order("created_at", { ascending: true });
      if (data) setMessages(data as Message[]);

      // Subscribe to realtime
      const channel = supabase
        .channel(`messages-${requestId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `request_id=eq.${requestId}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };
    init();
  }, [requestId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const supabase = supabaseRef.current;
    await supabase.from("messages").insert({
      request_id: requestId as string,
      sender_id: userId,
      content: newMessage.trim(),
    });
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-[calc(100vh-3.5rem)]">
      {/* Chat header with clickable name → profile sheet */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-background">
        <Button variant="ghost" size="icon" onClick={() => router.push("/chat")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <Sheet>
          <SheetTrigger
            render={<button className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity cursor-pointer" />}
          >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="font-semibold truncate text-sm">{chatTitle}</h1>
                {jobTitle && (
                  <p className="text-xs text-muted-foreground truncate">{jobTitle}</p>
                )}
              </div>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>{t("profile")}</SheetTitle>
            </SheetHeader>
            {otherUser && (
              <div className="mt-6 space-y-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                  <h2 className="text-lg font-bold">{otherUser.full_name}</h2>
                  <p className="text-sm text-muted-foreground capitalize">{otherUser.role}</p>
                </div>

                <Separator />

                {otherUser.phone && (
                  <div className="flex items-center gap-3 px-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${otherUser.phone}`} className="text-sm text-primary font-medium">
                      {otherUser.phone}
                    </a>
                  </div>
                )}

                {otherUser.role === "worker" && otherUser.rating_avg > 0 && (
                  <div className="flex items-center gap-3 px-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{otherUser.rating_avg.toFixed(1)} / 5</span>
                  </div>
                )}

                {otherUser.role === "worker" && (
                  <div className="flex items-center gap-3 px-2">
                    <div className={cn(
                      "w-2.5 h-2.5 rounded-full",
                      otherUser.is_available ? "bg-green-500" : "bg-gray-400"
                    )} />
                    <span className="text-sm">
                      {otherUser.is_available ? t("available") : t("not_available")}
                    </span>
                  </div>
                )}

                <Separator />

                <div className="px-2 text-xs text-muted-foreground">
                  {t("member_since")} {new Date(otherUser.created_at).toLocaleDateString()}
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.sender_id === userId ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[75%] px-4 py-2 rounded-2xl text-sm",
                msg.sender_id === userId
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted rounded-bl-md"
              )}
            >
              <p>{msg.content}</p>
              <p className={cn(
                "text-[10px] mt-1",
                msg.sender_id === userId ? "text-primary-foreground/60" : "text-muted-foreground"
              )}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Island-style input bar */}
      <div className="p-3 bg-background">
        <form
          onSubmit={sendMessage}
          className="flex items-center gap-2 bg-muted/50 rounded-full px-2 py-1.5 border shadow-sm"
        >
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t("type_message")}
            className="flex-1 bg-transparent border-0 outline-none px-3 py-1.5 text-sm placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all",
              newMessage.trim()
                ? "bg-primary text-primary-foreground shadow-md hover:opacity-90"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
