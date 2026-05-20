# Plan: Stub Backend for Frontend Handoff

Replace Supabase with in-memory/localStorage mocks so the UI keeps working with fake data, and document the backend contract for your developer.

## 1. Mock auth layer
- Rewrite `src/hooks/useAuth.tsx` to use a fake user stored in `localStorage` (no Supabase calls).
- `signIn` / `signUp` accept any email+password, create a fake user `{ id, email }`, store it, return success.
- `signOut` clears localStorage.
- `ProtectedRoute` keeps working unchanged.

## 2. Mock data client
- Create `src/lib/mockData.ts` with seeded wallets, transactions, profile, journal entries, chat messages, deriv accounts.
- Create `src/lib/mockClient.ts` exposing the same shape currently used (`from('wallets').select()`, `.insert()`, `.eq()`, `.rpc('convert_currency', ...)`, etc.) backed by the mock store + localStorage persistence.
- Replace `src/integrations/supabase/client.ts` export to point at the mock client so **no call site changes**.

## 3. Login / Signup / Reset pages
- Update to call the new mock auth (no Supabase imports). Forms still validate; submission navigates to `/dashboard`.

## 4. Edge function (`trading-coach`)
- Replace the `supabase.functions.invoke('trading-coach', ...)` call in the AI page with a mock streaming response (canned reply) so the chat UI still demos.

## 5. Remove Supabase wiring
- Delete `.env` Supabase vars (keep file empty or remove).
- Keep `src/integrations/supabase/types.ts` for TypeScript types (harmless, useful reference for backend dev).
- Leave `supabase/` folder + `config.toml` + edge function source as **reference** for the backend dev (documented in BACKEND.md).

## 6. BACKEND.md spec
Add `BACKEND.md` at repo root documenting for your backend developer:
- **Auth endpoints needed**: signup, login, logout, session, password reset (request shapes + response shapes).
- **Tables / resources**: profiles, wallets, transactions, deriv_accounts, deriv_funding_requests, trade_journal_entries, chat_conversations, chat_messages — with column types pulled from current schema.
- **RPC / business logic**: `convert_currency` (atomic wallet debit/credit + transaction insert).
- **Edge function**: `trading-coach` (streaming AI chat, model + system prompt).
- **Auth rules**: every row scoped to `user_id = current_user`.
- **Triggers needed**: auto-create profile + 5 wallets (NGN/USD/USDT/BTC/ETH) on signup.
- **Where mock data lives**: pointers to `src/lib/mockData.ts` and `src/lib/mockClient.ts` so the dev knows exactly what to swap.

## Result
- App runs with zero network calls.
- Every screen demos with realistic data.
- Backend dev has a single `BACKEND.md` + the mock client as the contract — they replace `mockClient.ts` with real fetch calls (or re-wire Supabase) and ship.

## Technical notes
- Mock client returns `{ data, error: null }` shape to match Supabase response so call sites stay identical.
- localStorage keys namespaced under `mock:*` for easy reset.
- No changes to UI components, routes, or styling.
