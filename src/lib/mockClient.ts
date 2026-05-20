/**
 * Frontend-only mock of the Supabase client.
 *
 * Mirrors the small subset of the Supabase JS API the app uses
 * (auth, .from(table).select/insert/update/delete chains, .rpc).
 * Data is persisted in localStorage so the demo survives reloads.
 *
 * To swap in a real backend: replace this file with a thin wrapper
 * over your API (or restore the real Supabase client) — call sites
 * elsewhere in the app do not need to change.
 *
 * See /BACKEND.md for the full contract.
 */

// ---------- Types ----------
export type MockUser = { id: string; email: string; user_metadata: Record<string, any> };
export type MockSession = { access_token: string; user: MockUser };

type Row = Record<string, any>;
type Table =
  | "wallets"
  | "profiles"
  | "transactions"
  | "deriv_accounts"
  | "deriv_funding_requests"
  | "trade_journal_entries"
  | "chat_conversations"
  | "chat_messages";

type Store = Record<Table, Row[]> & { _users: MockUser[]; _session: MockSession | null };

// ---------- Storage ----------
const LS_KEY = "mock:db:v1";

const uid = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const emptyStore = (): Store => ({
  _users: [],
  _session: null,
  wallets: [],
  profiles: [],
  transactions: [],
  deriv_accounts: [],
  deriv_funding_requests: [],
  trade_journal_entries: [],
  chat_conversations: [],
  chat_messages: [],
});

const load = (): Store => {
  if (typeof localStorage === "undefined") return emptyStore();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return emptyStore();
    return { ...emptyStore(), ...JSON.parse(raw) };
  } catch {
    return emptyStore();
  }
};

const save = (s: Store) => {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(s));
};

const db: Store = load();

const seedWalletsAndProfile = (user: MockUser) => {
  const currencies: Array<"NGN" | "USD" | "USDT" | "BTC" | "ETH"> = ["NGN", "USD", "USDT", "BTC", "ETH"];
  // Seed wallets with demo balances so the UI is not empty
  const seedBalances: Record<string, number> = { NGN: 250000, USD: 320.45, USDT: 1280.5, BTC: 0.012, ETH: 0.35 };
  currencies.forEach((c) => {
    db.wallets.push({
      id: uid(),
      user_id: user.id,
      currency: c,
      balance: seedBalances[c] ?? 0,
      available_balance: seedBalances[c] ?? 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  });
  db.profiles.push({
    id: uid(),
    user_id: user.id,
    username: user.user_metadata.username ?? user.email.split("@")[0],
    email: user.email,
    phone: user.user_metadata.phone ?? null,
    referral_code: user.user_metadata.referral_code ?? null,
    country: user.user_metadata.country ?? null,
    country_code: user.user_metadata.country_code ?? null,
    currency: user.user_metadata.currency ?? "USD",
    email_verified: true,
    phone_verified: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  // A couple of demo transactions
  const ngnWallet = db.wallets.find((w) => w.user_id === user.id && w.currency === "NGN");
  if (ngnWallet) {
    db.transactions.push({
      id: uid(),
      user_id: user.id,
      wallet_id: ngnWallet.id,
      type: "deposit",
      currency: "NGN",
      amount: 100000,
      status: "completed",
      description: "Welcome bonus",
      metadata: {},
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    });
  }
};

// ---------- Auth ----------
type AuthCallback = (event: string, session: MockSession | null) => void;
const authListeners = new Set<AuthCallback>();

const fireAuth = (event: string) => {
  authListeners.forEach((cb) => cb(event, db._session));
};

const auth = {
  async signUp({ email, password, options }: { email: string; password: string; options?: { data?: Record<string, any>; emailRedirectTo?: string } }) {
    if (!email || !password) return { data: null, error: { message: "Email and password required" } };
    if (db._users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { data: null, error: { message: "An account with that email already exists" } };
    }
    const user: MockUser = { id: uid(), email, user_metadata: options?.data ?? {} };
    db._users.push(user);
    seedWalletsAndProfile(user);
    db._session = { access_token: "mock-token-" + user.id, user };
    save(db);
    setTimeout(() => fireAuth("SIGNED_IN"), 0);
    return { data: { user, session: db._session }, error: null };
  },

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    if (!email || !password) return { data: null, error: { message: "Email and password required" } };
    let user = db._users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    // Frontend demo: if no account exists, auto-create one so anyone can log in.
    if (!user) {
      user = { id: uid(), email, user_metadata: { username: email.split("@")[0] } };
      db._users.push(user);
      seedWalletsAndProfile(user);
    }
    db._session = { access_token: "mock-token-" + user.id, user };
    save(db);
    setTimeout(() => fireAuth("SIGNED_IN"), 0);
    return { data: { user, session: db._session }, error: null };
  },

  async resetPasswordForEmail(_email: string, _opts?: any) {
    // No-op in mock; pretend success
    return { data: {}, error: null };
  },

  async updateUser(_attrs: { password?: string }) {
    return { data: { user: db._session?.user ?? null }, error: null };
  },

  async signOut() {
    db._session = null;
    save(db);
    setTimeout(() => fireAuth("SIGNED_OUT"), 0);
    return { error: null };
  },

  async getSession() {
    return { data: { session: db._session } };
  },

  async getUser() {
    return { data: { user: db._session?.user ?? null }, error: null };
  },

  onAuthStateChange(cb: AuthCallback) {
    authListeners.add(cb);
    return {
      data: {
        subscription: {
          unsubscribe: () => { authListeners.delete(cb); },
        },
      },
    };
  },
};

// ---------- Query builder ----------
type Filter = { col: string; op: "eq" | "in" | "gte" | "lte"; val: any };

class QueryBuilder<T = any> implements PromiseLike<{ data: T | null; error: any }> {
  private filters: Filter[] = [];
  private _columns: string | null = null;
  private _order: { col: string; ascending: boolean } | null = null;
  private _limit: number | null = null;
  private _op: "select" | "insert" | "update" | "delete" = "select";
  private _payload: Row | Row[] | null = null;
  private _single: false | "single" | "maybeSingle" = false;

  constructor(private table: Table) {}

  select(cols?: string) {
    this._columns = cols ?? "*";
    // If called after insert/update, just mark to return rows
    return this;
  }
  insert(payload: Row | Row[]) {
    this._op = "insert";
    this._payload = payload;
    return this;
  }
  update(payload: Row) {
    this._op = "update";
    this._payload = payload;
    return this;
  }
  delete() {
    this._op = "delete";
    return this;
  }
  eq(col: string, val: any) { this.filters.push({ col, op: "eq", val }); return this; }
  in(col: string, val: any[]) { this.filters.push({ col, op: "in", val }); return this; }
  gte(col: string, val: any) { this.filters.push({ col, op: "gte", val }); return this; }
  lte(col: string, val: any) { this.filters.push({ col, op: "lte", val }); return this; }
  order(col: string, opts?: { ascending?: boolean }) {
    this._order = { col, ascending: opts?.ascending ?? true };
    return this;
  }
  limit(n: number) { this._limit = n; return this; }
  single() { this._single = "single"; return this.exec(); }
  maybeSingle() { this._single = "maybeSingle"; return this.exec(); }

  private applyFilters(rows: Row[]): Row[] {
    return rows.filter((r) =>
      this.filters.every((f) => {
        if (f.op === "eq") return r[f.col] === f.val;
        if (f.op === "in") return f.val.includes(r[f.col]);
        if (f.op === "gte") return r[f.col] >= f.val;
        if (f.op === "lte") return r[f.col] <= f.val;
        return true;
      })
    );
  }

  private async exec(): Promise<{ data: any; error: any }> {
    const tableRows = db[this.table] as Row[];

    if (this._op === "insert") {
      const list = Array.isArray(this._payload) ? this._payload : [this._payload!];
      const inserted = list.map((row) => {
        const now = new Date().toISOString();
        const newRow: Row = {
          id: uid(),
          created_at: now,
          updated_at: now,
          ...row,
        };
        tableRows.push(newRow);
        return newRow;
      });
      save(db);
      if (this._single === "single") return { data: inserted[0], error: null };
      if (this._columns) return { data: inserted, error: null };
      return { data: null, error: null };
    }

    if (this._op === "update") {
      const matches = this.applyFilters(tableRows);
      matches.forEach((r) => {
        Object.assign(r, this._payload, { updated_at: new Date().toISOString() });
      });
      save(db);
      return { data: matches, error: null };
    }

    if (this._op === "delete") {
      const keep: Row[] = [];
      const removed: Row[] = [];
      tableRows.forEach((r) => {
        const match = this.filters.every((f) => {
          if (f.op === "eq") return r[f.col] === f.val;
          if (f.op === "in") return f.val.includes(r[f.col]);
          return true;
        });
        if (match) removed.push(r); else keep.push(r);
      });
      (db[this.table] as Row[]) = keep;
      // Reassign in place
      tableRows.length = 0;
      tableRows.push(...keep);
      save(db);
      return { data: removed, error: null };
    }

    // select
    let result = this.applyFilters(tableRows);
    if (this._order) {
      const { col, ascending } = this._order;
      result = [...result].sort((a, b) => {
        if (a[col] === b[col]) return 0;
        const cmp = a[col] > b[col] ? 1 : -1;
        return ascending ? cmp : -cmp;
      });
    }
    if (this._limit != null) result = result.slice(0, this._limit);
    if (this._single === "single") {
      if (result.length === 0) return { data: null, error: { message: "Not found" } };
      return { data: result[0], error: null };
    }
    if (this._single === "maybeSingle") {
      return { data: result[0] ?? null, error: null };
    }
    return { data: result, error: null };
  }

  // PromiseLike — lets `await builder` resolve like Supabase does.
  then<TResult1 = { data: T | null; error: any }, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.exec().then(onfulfilled as any, onrejected as any);
  }
}

// ---------- RPC ----------
const rpc = async (name: string, args: Record<string, any>) => {
  if (name === "convert_currency") {
    const session = db._session;
    if (!session) return { data: null, error: { message: "Not authenticated" } };
    const { _from_currency, _to_currency, _from_amount, _rate } = args;
    const fromW = db.wallets.find((w) => w.user_id === session.user.id && w.currency === _from_currency);
    const toW = db.wallets.find((w) => w.user_id === session.user.id && w.currency === _to_currency);
    if (!fromW || !toW) return { data: null, error: { message: "Wallet not found" } };
    if (Number(fromW.available_balance) < _from_amount) {
      return { data: null, error: { message: "Insufficient available balance" } };
    }
    const toAmount = Number((_from_amount * _rate).toFixed(8));
    fromW.balance = Number(fromW.balance) - _from_amount;
    fromW.available_balance = Number(fromW.available_balance) - _from_amount;
    toW.balance = Number(toW.balance) + toAmount;
    toW.available_balance = Number(toW.available_balance) + toAmount;
    const reference = "CNV-" + uid().replace(/-/g, "").slice(0, 10).toUpperCase();
    db.transactions.push({
      id: uid(),
      user_id: session.user.id,
      wallet_id: fromW.id,
      type: "convert",
      currency: _from_currency,
      amount: _from_amount,
      status: "completed",
      reference,
      description: `${_from_currency} → ${_to_currency} @ ${_rate}`,
      metadata: {
        from_currency: _from_currency,
        to_currency: _to_currency,
        from_amount: _from_amount,
        to_amount: toAmount,
        rate: _rate,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    save(db);
    return { data: { reference, from_amount: _from_amount, to_amount: toAmount, rate: _rate }, error: null };
  }
  return { data: null, error: { message: `RPC ${name} not implemented in mock` } };
};

// ---------- Public client ----------
export const supabase = {
  auth,
  from: <T = any>(table: Table) => new QueryBuilder<T>(table),
  rpc,
  // Stub for any leftover edge-function invocations
  functions: {
    invoke: async (_name: string, _opts?: any) => ({ data: null, error: { message: "Edge functions disabled in mock" } }),
  },
};

export default supabase;
