import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatMsg { role: "user" | "assistant" | "system"; content: string }

const SYSTEM_PROMPT = `You are PremiumX AI Trading Coach, an expert in forex, crypto, and synthetic indices trading (especially Deriv markets like Volatility 75, Step Index, Boom/Crash).

Your style:
- Direct, practical, no fluff
- Emphasize risk management, discipline, and journaling
- When the user shares trade data, look for patterns: best/worst instruments, win rate by strategy, emotion vs P&L, day-of-week effects
- Never give specific buy/sell signals or guaranteed predictions — markets are uncertain
- Suggest position sizing in % of account (e.g. 1-2% risk per trade)
- Use markdown: tables, bold, lists for clarity

When the user has journal entries, you'll see a JOURNAL CONTEXT block with their recent trades. Reference specific trades, dates, and patterns from that data when relevant.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { messages } = await req.json() as { messages: ChatMsg[] };
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Pull user's recent journal entries as context
    const { data: trades } = await supabase
      .from("trade_journal_entries")
      .select("trade_date,instrument,direction,pnl_amount,pnl_currency,outcome,strategy,emotion_rating,notes")
      .order("trade_date", { ascending: false })
      .limit(50);

    let journalContext = "";
    if (trades && trades.length > 0) {
      const summary = trades.map((t: any) =>
        `${t.trade_date} | ${t.instrument} ${t.direction.toUpperCase()} | P&L: ${t.pnl_amount} ${t.pnl_currency} | ${t.outcome}${t.strategy ? ` | strategy: ${t.strategy}` : ""}${t.emotion_rating ? ` | discipline: ${t.emotion_rating}/5` : ""}${t.notes ? ` | notes: ${t.notes}` : ""}`
      ).join("\n");
      journalContext = `\n\nJOURNAL CONTEXT (user's last ${trades.length} trades):\n${summary}`;
    } else {
      journalContext = "\n\nJOURNAL CONTEXT: User has no journal entries yet. Encourage them to start logging trades.";
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + journalContext },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Lovable Cloud settings." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("trading-coach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
