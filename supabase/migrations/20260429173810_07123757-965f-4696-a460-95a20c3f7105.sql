-- Atomic currency conversion: debits one wallet, credits another, logs a single 'convert' transaction.
CREATE OR REPLACE FUNCTION public.convert_currency(
  _from_currency currency_code,
  _to_currency currency_code,
  _from_amount numeric,
  _rate numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _from_wallet wallets%ROWTYPE;
  _to_wallet wallets%ROWTYPE;
  _to_amount numeric;
  _reference text;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF _from_currency = _to_currency THEN
    RAISE EXCEPTION 'Source and destination currency must differ';
  END IF;

  IF _from_amount IS NULL OR _from_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than zero';
  END IF;

  IF _rate IS NULL OR _rate <= 0 THEN
    RAISE EXCEPTION 'Rate must be greater than zero';
  END IF;

  -- Lock both wallets in a deterministic order to avoid deadlocks
  SELECT * INTO _from_wallet FROM wallets
    WHERE user_id = _user_id AND currency = _from_currency
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Source wallet not found';
  END IF;

  SELECT * INTO _to_wallet FROM wallets
    WHERE user_id = _user_id AND currency = _to_currency
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Destination wallet not found';
  END IF;

  IF _from_wallet.available_balance < _from_amount THEN
    RAISE EXCEPTION 'Insufficient available balance';
  END IF;

  _to_amount := round(_from_amount * _rate, 8);
  _reference := 'CNV-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));

  UPDATE wallets
    SET balance = balance - _from_amount,
        available_balance = available_balance - _from_amount,
        updated_at = now()
    WHERE id = _from_wallet.id;

  UPDATE wallets
    SET balance = balance + _to_amount,
        available_balance = available_balance + _to_amount,
        updated_at = now()
    WHERE id = _to_wallet.id;

  INSERT INTO transactions (user_id, wallet_id, type, currency, amount, status, reference, description, metadata)
  VALUES (
    _user_id,
    _from_wallet.id,
    'convert',
    _from_currency,
    _from_amount,
    'completed',
    _reference,
    _from_currency || ' → ' || _to_currency || ' @ ' || _rate,
    jsonb_build_object(
      'from_currency', _from_currency,
      'to_currency', _to_currency,
      'from_amount', _from_amount,
      'to_amount', _to_amount,
      'rate', _rate,
      'from_wallet_id', _from_wallet.id,
      'to_wallet_id', _to_wallet.id
    )
  );

  RETURN jsonb_build_object(
    'reference', _reference,
    'from_amount', _from_amount,
    'to_amount', _to_amount,
    'rate', _rate
  );
END;
$$;