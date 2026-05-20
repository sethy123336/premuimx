import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Loader2, Plus, MessageSquare, Sparkles, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import BottomNav from "@/components/dashboard/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface Conversation { id: string; title: string; updated_at: string }
interface ChatMsg { id?: string; role: "user" | "assistant"; content: string }

const QUICK_PROMPTS = [
  "Analyze my trades from this month",
  "What's my biggest weakness based on my journal?",
  "Give me a pre-trade checklist for breakouts",
  "How should I size positions on Volatility 75?",
];

const AI = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("chat_conversations")
      .select("id,title,updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(30);
    if (data) setConversations(data as Conversation[]);
  };

  const loadMessages = async (convId: string) => {
    setLoadingMsgs(true);
    const { data } = await supabase
      .from("chat_messages")
      .select("id,role,content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    setLoadingMsgs(false);
    if (data) setMessages(data.filter((m: any) => m.role !== "system") as ChatMsg[]);
  };

  useEffect(() => {
    if (!user) return;
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (activeId) loadMessages(activeId);
    else setMessages([]);
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const startNewChat = () => {
    setActiveId(null);
    setMessages([]);
    setInput("");
  };

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this conversation?")) return;
    await supabase.from("chat_messages").delete().eq("conversation_id", id);
    await supabase.from("chat_conversations").delete().eq("id", id);
    if (activeId === id) startNewChat();
    await loadConversations();
  };

  const send = async (text: string) => {
    if (!user || !text.trim() || streaming) return;
    const userMessage: ChatMsg = { role: "user", content: text.trim() };

    let convId = activeId;
    // Create conversation on first message
    if (!convId) {
      const title = text.trim().slice(0, 50);
      const { data, error } = await supabase
        .from("chat_conversations")
        .insert({ user_id: user.id, title })
        .select()
        .single();
      if (error || !data) {
        toast({ title: "Failed to start chat", description: error?.message, variant: "destructive" });
        return;
      }
      convId = data.id;
      setActiveId(convId);
      await loadConversations();
    }

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setStreaming(true);

    // Persist user message
    await supabase.from("chat_messages").insert({
      conversation_id: convId,
      user_id: user.id,
      role: "user",
      content: userMessage.content,
    });

    // MOCK: simulate a streamed AI reply token-by-token (no backend call).
    let assistantText = "";
    try {
      const reply = `Here's a quick take on **"${userMessage.content.slice(0, 80)}"**:\n\n` +
        `- Review your last 5 trades and look for **one repeating mistake**.\n` +
        `- Define your **risk per trade** as a fixed % of equity (1–2%).\n` +
        `- Journal **emotion + setup quality** alongside P&L.\n\n` +
        `_(This is a mock response — your backend developer will wire up the real AI in \`/BACKEND.md\` → trading-coach.)_`;

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const tokens = reply.split(/(\s+)/);
      for (const t of tokens) {
        await new Promise((r) => setTimeout(r, 20));
        assistantText += t;
        setMessages((prev) =>
          prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantText } : m))
        );
      }


      // Persist assistant message
      if (assistantText) {
        await supabase.from("chat_messages").insert({
          conversation_id: convId,
          user_id: user.id,
          role: "assistant",
          content: assistantText,
        });
        await supabase.from("chat_conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId);
      }
    } catch (err) {
      console.error("Chat error:", err);
      toast({ title: "Chat failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setStreaming(false);
    }
  };

  const showWelcome = useMemo(() => messages.length === 0 && !streaming, [messages, streaming]);

  return (
    <div className="min-h-screen bg-[hsl(220,40%,7%)] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-4 border-b border-white/5">
        <button onClick={() => navigate("/dashboard")} className="text-white/70 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" /> Trading Coach
          </h1>
          <p className="text-[10px] text-white/40">Powered by PremiumX AI</p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <button className="text-white/60 hover:text-white p-2"><MessageSquare className="w-4 h-4" /></button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-[hsl(220,30%,10%)] border-white/10 text-white">
            <SheetHeader>
              <SheetTitle className="text-white">Conversations</SheetTitle>
            </SheetHeader>
            <Button onClick={startNewChat} variant="outline" className="w-full mt-4 border-white/20 text-white hover:bg-white/10">
              <Plus className="w-4 h-4 mr-1" /> New Chat
            </Button>
            <div className="mt-3 space-y-1.5 max-h-[70vh] overflow-y-auto">
              {conversations.length === 0 && (
                <p className="text-xs text-white/40 text-center py-6">No chats yet.</p>
              )}
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between group ${activeId === c.id ? "bg-amber-400/15 border border-amber-400/30" : "bg-white/[0.03] border border-white/5 hover:bg-white/5"}`}
                >
                  <span className="text-xs truncate">{c.title}</span>
                  <button onClick={(e) => deleteConversation(c.id, e)} className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-white/60 hover:text-red-300">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
        <button onClick={startNewChat} className="text-white/60 hover:text-white p-2"><Plus className="w-4 h-4" /></button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 pb-32">
        {loadingMsgs ? (
          <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-white/40" /></div>
        ) : showWelcome ? (
          <div className="flex flex-col items-center justify-center text-center pt-10 pb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/30 to-purple-500/20 border border-amber-400/30 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <h2 className="text-lg font-bold">PremiumX AI Coach</h2>
            <p className="text-xs text-white/50 mt-1 max-w-xs">Personalized insights from your trade journal. Ask about patterns, strategies, or risk.</p>
            <div className="mt-5 w-full max-w-md grid grid-cols-1 gap-2">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-left text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2.5"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl mx-auto">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${m.role === "user" ? "bg-amber-400 text-black" : "bg-[hsl(220,30%,12%)] border border-white/5 text-white/90"}`}>
                  {m.role === "assistant" ? (
                    <div className="prose prose-invert prose-sm max-w-none prose-p:my-1.5 prose-headings:my-2 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0 prose-table:text-xs">
                      <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              </div>
            ))}
            {streaming && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="bg-[hsl(220,30%,12%)] border border-white/5 rounded-2xl px-3.5 py-2.5 text-sm text-white/60">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="fixed bottom-[68px] left-0 right-0 px-4 py-3 bg-[hsl(220,40%,7%)] border-t border-white/5">
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder="Ask the coach..."
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/50 resize-none max-h-32"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || streaming}
            className="w-10 h-10 rounded-full bg-amber-400 text-black flex items-center justify-center hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AI;
