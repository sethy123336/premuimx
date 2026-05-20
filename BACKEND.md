# PremiumX — Backend Contract

This frontend currently runs on a **mock client** (`src/lib/mockClient.ts`) that
persists data in `localStorage`. Every place the UI talks to "the backend" goes
through `import { supabase } from "@/integrations/supabase/client"`, which is
re-exported from the mock.

To swap in a real backend, replace the mock with a thin adapter that exposes the
same surface — call sites do not need to change.

---

## 1. Auth

The UI calls these methods on `supabase.auth`:

| Method | Used in | Expected response |
|---|---|---|
| `signUp({ email, password, options: { data, emailRedirectTo } })` | `pages/Signup.tsx` | `{ data: { user, session }, error }` — should also create the user's profile + 5 wallets (see §3). `options.data` carries `username, phone, referral_code, country, country_code, currency`. |
| `signInWithPassword({ email, password })` | `pages/Login.tsx` | `{ data: { user, session }, error }` |
| `resetPasswordForEmail(email, { redirectTo })` | `pages/Login.tsx` | `{ error }` — emails a reset link |
| `updateUser({ password })` | `pages/ResetPassword.tsx` | `{ error }` — updates the signed-in user's password |
| `signOut()` | `useAuth`, `DrawerMenu` | `{ error }` |
| `getSession()` | `useAuth`, `ResetPassword` | `{ data: { session } }` |
| `onAuthStateChange(cb)` | `useAuth`, `ResetPassword` | `{ data: { subscription: { unsubscribe } } }` — fire `SIGNED_IN` / `SIGNED_OUT` / `PASSWORD_RECOVERY` |

Session shape: `{ access_token, user: { id, email, user_metadata } }`.

---

## 2. Data access surface

The UI uses a Supabase-style query builder. Whatever backend you build, expose
the same chainable API or replace `mockClient.ts` with `fetch()` calls.

Operations used:

- `from(table).select(cols).eq(col,val).in(col,vals).gte(col,val).lte(col,val).order(col,{ascending}).limit(n)` → returns `{ data: rows[], error }`
- `.maybeSingle()` / `.single()` → returns `{ data: row|null, error }`
- `from(table).insert(row).select().single()` → `{ data: row, error }`
- `from(table).update(patch).eq(...)` → `{ error }`
- `from(table).delete().eq(...)` → `{ error }`
- `rpc(name, args)` → `{ data, error }`

Every row is scoped to the authenticated user (`user_id = current_user`). The
real backend MUST enforce this server-side (RLS, middleware, etc.).

---

## 3. Tables

All tables have `id uuid pk`, `created_at`, `updated_at` (where shown).

### `profiles`
`user_id uuid` (1:1 with auth user), `username text`, `email text`, `phone text`,
`referral_code text`, `country text`, `country_code text`, `currency text`,
`email_verified bool`, `phone_verified bool`.

### `wallets`
`user_id uuid`, `currency` ∈ `NGN | USD | USDT | BTC | ETH`, `balance numeric`,
`available_balance numeric`. **On signup, auto-create one wallet per currency.**

### `transactions`
`user_id`, `wallet_id`, `type` ∈ `deposit | withdraw | convert | deriv_funding | …`,
`currency`, `amount numeric`, `status` ∈ `pending | completed | failed | cancelled`,
`reference text`, `description text`, `metadata jsonb`.

### `deriv_accounts`
`user_id`, `cr_number text` (format `CR\d{5,12}`), `nickname text`, `is_default bool`.

### `deriv_funding_requests`
`user_id`, `deriv_account_id`, `cr_number`, `source_wallet_id`, `currency`,
`amount numeric`, `status`, `notes text`.

### `trade_journal_entries`
`user_id`, `trade_date date`, `instrument text`, `direction text`,
`entry_price`, `exit_price`, `position_size`, `pnl_amount numeric`,
`pnl_currency text`, `outcome text`, `emotion_rating int`, `notes text`,
`screenshot_url text`, `strategy text`.

### `chat_conversations`
`user_id`, `title text`, `updated_at`.

### `chat_messages`
`user_id`, `conversation_id`, `role` ∈ `user | assistant | system`, `content text`.

---

## 4. RPC / business logic

### `convert_currency(_from_currency, _to_currency, _from_amount, _rate)`
Atomically:
1. Lock both wallets for the signed-in user.
2. Verify `from.available_balance >= _from_amount`.
3. Debit `from`, credit `to` by `_from_amount * _rate`.
4. Insert a `transactions` row of type `convert`.
5. Return `{ reference, from_amount, to_amount, rate }`.

---

## 5. AI chat (Trading Coach)

`src/pages/AI.tsx` currently renders a fake streamed reply. The real backend
should expose a streaming endpoint (SSE or `ReadableStream`) that takes:

```json
{ "messages": [{ "role": "user", "content": "..." }, ...] }
```

…and streams OpenAI-style `data: { choices: [{ delta: { content } }] }` chunks
terminated by `data: [DONE]`. Status codes `429` (rate limit) and `402` (out of
credits) are already handled in the UI.

Suggested implementation: edge function calling an LLM (the original Supabase
project had `supabase/functions/trading-coach/index.ts` — kept in the repo as a
reference, but no longer wired to the frontend).

---

## 6. Where to make changes

- **Replace `src/lib/mockClient.ts`** with real fetch/SDK calls.
- **Delete localStorage seed** (the `seedWalletsAndProfile` helper).
- **Re-enable real streaming** in `src/pages/AI.tsx` (search for the `MOCK:` comment).
- `src/integrations/supabase/types.ts` was generated from the original Supabase
  schema — useful reference for typing your new client. Re-generate or hand-edit
  to match your real backend.

The rest of the UI does not need to change.
