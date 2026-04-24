
-- ============ ENUMS ============
CREATE TYPE public.currency_code AS ENUM ('NGN', 'USD', 'USDT', 'BTC', 'ETH');
CREATE TYPE public.transaction_type AS ENUM ('deposit', 'withdrawal', 'transfer', 'convert', 'deriv_funding');
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');

-- ============ WALLETS ============
CREATE TABLE public.wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  currency public.currency_code NOT NULL,
  balance NUMERIC(20, 8) NOT NULL DEFAULT 0,
  available_balance NUMERIC(20, 8) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, currency)
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own wallets" ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own wallets" ON public.wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own wallets" ON public.wallets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ TRANSACTIONS ============
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
  type public.transaction_type NOT NULL,
  status public.transaction_status NOT NULL DEFAULT 'pending',
  amount NUMERIC(20, 8) NOT NULL,
  currency public.currency_code NOT NULL,
  reference TEXT,
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_user_created ON public.transactions(user_id, created_at DESC);
CREATE INDEX idx_transactions_type ON public.transactions(type);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ DERIV ACCOUNTS ============
CREATE TABLE public.deriv_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cr_number TEXT NOT NULL,
  nickname TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, cr_number)
);

ALTER TABLE public.deriv_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own deriv accounts" ON public.deriv_accounts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own deriv accounts" ON public.deriv_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own deriv accounts" ON public.deriv_accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_deriv_accounts_updated_at
  BEFORE UPDATE ON public.deriv_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ DERIV FUNDING REQUESTS ============
CREATE TABLE public.deriv_funding_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deriv_account_id UUID REFERENCES public.deriv_accounts(id) ON DELETE SET NULL,
  cr_number TEXT NOT NULL,
  source_wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
  amount NUMERIC(20, 8) NOT NULL,
  currency public.currency_code NOT NULL,
  status public.transaction_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_deriv_funding_user_created ON public.deriv_funding_requests(user_id, created_at DESC);

ALTER TABLE public.deriv_funding_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own funding requests" ON public.deriv_funding_requests
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own funding requests" ON public.deriv_funding_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own funding requests" ON public.deriv_funding_requests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_deriv_funding_updated_at
  BEFORE UPDATE ON public.deriv_funding_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ AUTO-CREATE WALLETS ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user_wallets()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.wallets (user_id, currency) VALUES
    (NEW.id, 'NGN'),
    (NEW.id, 'USD'),
    (NEW.id, 'USDT'),
    (NEW.id, 'BTC'),
    (NEW.id, 'ETH');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_wallets
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallets();

-- Backfill wallets for any existing users
INSERT INTO public.wallets (user_id, currency)
SELECT u.id, c.currency
FROM auth.users u
CROSS JOIN (VALUES ('NGN'::public.currency_code), ('USD'), ('USDT'), ('BTC'), ('ETH')) AS c(currency)
ON CONFLICT (user_id, currency) DO NOTHING;
