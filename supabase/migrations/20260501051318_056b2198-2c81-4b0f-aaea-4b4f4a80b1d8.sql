CREATE TABLE public.trade_journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trade_date DATE NOT NULL,
  instrument TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('buy','sell')),
  entry_price NUMERIC,
  exit_price NUMERIC,
  position_size NUMERIC,
  pnl_amount NUMERIC NOT NULL DEFAULT 0,
  pnl_currency TEXT NOT NULL DEFAULT 'USD',
  outcome TEXT NOT NULL DEFAULT 'breakeven' CHECK (outcome IN ('win','loss','breakeven')),
  strategy TEXT,
  emotion_rating INTEGER CHECK (emotion_rating BETWEEN 1 AND 5),
  notes TEXT,
  screenshot_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_trade_journal_user_date ON public.trade_journal_entries (user_id, trade_date DESC);

ALTER TABLE public.trade_journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own journal entries" ON public.trade_journal_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own journal entries" ON public.trade_journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own journal entries" ON public.trade_journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own journal entries" ON public.trade_journal_entries
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_trade_journal_updated_at
  BEFORE UPDATE ON public.trade_journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();