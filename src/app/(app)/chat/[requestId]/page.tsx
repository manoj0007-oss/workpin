"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";

export default function ChatRoomPage() {
    const { requestId } = useParams();
    const router = useRouter();
    const { t } = useI18n();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [userId, setUserId] = useState<string>("");
    const [chatTitle, setChatTitle] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);
    const supabaseRef = useRef(createClient());

    useEffect(() => {
        const init = async () => {
            const supabase = supabaseRef.current;
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUserId(user.id);

            // Get request info for title
            const { data: req } = await supabase
                .from("requests")
                .select("*, job:jobs(title), worker:profiles!requests_worker_id_fkey(full_name)")
                .eq("id", requestId as string)
                .single();
            if (req) {
                setChatTitle((req as any).job?.title || "Chat");
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
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b bg-background">
                <Button variant="ghost" size="icon" onClick={() => router.push("/chat")}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="font-semibold truncate">{chatTitle}</h1>
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

            {/* Input */}
            <form onSubmit={sendMessage} className="border-t p-3 flex gap-2 bg-background">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t("type_message")}
                    className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
    );
}
