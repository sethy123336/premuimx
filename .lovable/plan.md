
# PremiumX — Phased Build Plan

A staged redesign + feature buildout. Each phase ends in a shippable, testable slice. We confirm scope of each phase before moving to the next.

---

## Phase 0 — Design Foundation (1 step, blocking)

Lock the visual language before any rebuild so every new screen is consistent.

- Confirm direction: keep current dark navy + DM Sans, or explore a fresh palette/type.
- Define the 60/30/10 system in `index.css` as semantic tokens (background, surface, surface-elevated, primary, accent, success, danger, muted).
- Standardize: radii, spacing scale, shadow tiers, gradient tokens, motion durations.
- Reusable primitives: `PageShell`, `SectionHeader`, `StatCard`, `ActionButton`, `Modal`, `EmptyState`, `Skeleton`.

Deliverable: updated `index.css` + `tailwind.config.ts` + a small style-guide route for QA.

---

## Phase 1 — Landing Page Redesign

Public marketing surface only.

- Top nav: Home, Wallets, Brokerage Funding, PremiumX AI, Support + Get Started / Login.
- Hero: tagline "Fund, Convert, Trade & Grow with AI", dual CTA.
- Feature preview cards: Wallet System, Brokerage Funding, PremiumX AI (with sub-bullets).
- Rates strip (live USD/NGN, BTC, ETH, USDT) using Coingecko + an FX API.
- Footer: Privacy, Terms, Contact, Socials.
- Scroll reveals already in place — reuse.

---

## Phase 2 — Authentication Upgrade

Extend current email/password flow.

- Signup fields: Username, Email, Country (with auto-detect via IP), Phone, Password, Confirm.
- Currency auto-set rule (NGN/USD/etc.) stored on profile.
- Email verification + OTP (Twilio) for phone.
- Login: email/username, Remember Me, Forgot Password (+ `/reset-password` page).
- Optional later: Google / Apple OAuth (configured in Supabase dashboard).

DB: extend `profiles` (country, currency, phone_verified, email_verified).

---

## Phase 3 — Dashboard Redesign

Rebuild `/dashboard` against the new design system.

- Header: hamburger drawer (profile, settings, notifications, products), bell, avatar.
- Welcome block with first name.
- Main Balance Card: NGN/USD toggle, hide-balance eye, live FX.
- Live Rates strip: USD/NGN, BTC/USD, ETH/USD, USDT/NGN + trend deltas.
- Quick Actions: Fund, Withdraw, Convert, Send (modals).
- Transactions list with filter tabs: All / Successful / Pending / Failed.
- Bottom nav stays.

---

## Phase 4 — Wallet System

- Wallets index: NGN, USD, USDT, BTC, ETH.
- Wallet detail: balance, deposit address generator, QR, copy, send/receive.
- Network selectors: USDT (TRC20/BEP20/ERC20), ETH (ERC20), BTC.
- Internal transfer to AstroTag.
- Swap/Convert (already partially built — polish UI + add BTC/ETH).

DB: `wallet_addresses` (wallet_id, network, address), extend `transactions` with network/tx_hash.

---

## Phase 5 — Brokerage Funding

- Providers page with search: Deriv, PayPal, Skrill, Binance, Bybit, Neteller.
- Deposit flow: select → account ID/email → amount → confirm → processing → receipt.
- Withdrawal flow: platform → destination → amount → security PIN → submit.
- Funding history + status tracking.
- Provider integrations stubbed first (manual ops queue), then wired one-by-one (Deriv first — already started).

DB: `brokerage_accounts`, `funding_requests` (extend existing `deriv_funding_requests` into a generic table).

---

## Phase 6 — PremiumX AI

Build on existing `trading-coach` edge function.

- AI hub `/ai` with tabs: Trade Insights, Business Adviser, Rate Updates, Crypto News, Chat.
- Persistent threads (chat_conversations / chat_messages already exist).
- Floating PX AI button on dashboard.
- News + rates panels powered by external APIs (cached server-side).
- Lovable AI Gateway (Gemini 3 Flash default).

---

## Phase 7 — Platform Features

- Notifications: in-app bell + push (later).
- Security: 2FA, withdrawal PIN, biometric (mobile webauthn), withdrawal email approval.
- Profile: KYC (ID, selfie, address) with storage bucket + admin review queue.
- Manage bank / crypto / brokerage accounts.
- Support: live chat widget, WhatsApp deeplink, email, help center.
- Referrals: code, invite, earnings ledger, leaderboard.
- Settings: theme, language, notification prefs, logout.

---

## Phase 8 — Backend Hardening & Launch

- Audit RLS on every table.
- Edge functions for: rates cache, news cache, OTP, KYC review, referral payouts.
- Secrets: COINGECKO_API_KEY, FX_API_KEY, TWILIO_*, provider keys (added when each integration starts).
- Analytics + error monitoring.
- Performance pass, SEO meta, publish.

---

## Suggested Order of Execution

```text
Phase 0  → design tokens          (foundation)
Phase 1  → landing                (public face)
Phase 3  → dashboard              (core daily surface)
Phase 2  → auth upgrades          (in parallel-able)
Phase 4  → wallets
Phase 5  → brokerage funding
Phase 6  → AI hub
Phase 7  → platform features
Phase 8  → hardening + launch
```

## What I need from you to start

1. Confirm the phase order above (or reshuffle).
2. Phase 0 design direction: keep current dark navy, or generate 3 fresh directions to pick from?
3. Which phase do we ship first after Phase 0 — Landing (Phase 1) or Dashboard (Phase 3)?
