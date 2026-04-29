// Shared wallet currency formatting + USD conversion helpers.

export type Currency = "NGN" | "USD" | "USDT" | "BTC" | "ETH";

export const CURRENCY_LABELS: Record<Currency, string> = {
  NGN: "Nigerian Naira",
  USD: "US Dollar",
  USDT: "Tether",
  BTC: "Bitcoin",
  ETH: "Ethereum",
};

export const CURRENCY_TONES: Record<Currency, string> = {
  NGN: "from-emerald-500/20 to-emerald-500/5 text-emerald-300",
  USD: "from-sky-500/20 to-sky-500/5 text-sky-300",
  USDT: "from-teal-500/20 to-teal-500/5 text-teal-300",
  BTC: "from-amber-500/20 to-amber-500/5 text-amber-300",
  ETH: "from-purple-500/20 to-purple-500/5 text-purple-300",
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  NGN: "₦",
  USD: "$",
  USDT: "₮",
  BTC: "₿",
  ETH: "Ξ",
};

export const formatBalance = (currency: Currency, value: number) => {
  const digits = currency === "BTC" || currency === "ETH" ? 6 : 2;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
};

export const formatWithSymbol = (currency: Currency, value: number) => {
  const sym = CURRENCY_SYMBOLS[currency];
  return `${sym}${formatBalance(currency, value)}`;
};

// Live USD rates fetched once per session. Keys = "X per 1 USD".
export interface UsdRates {
  NGN: number; // NGN per 1 USD
  BTC: number; // BTC per 1 USD
  ETH: number; // ETH per 1 USD
}

export const fetchUsdRates = async (): Promise<UsdRates> => {
  const fallback: UsdRates = { NGN: 1600, BTC: 1 / 65000, ETH: 1 / 3500 };
  try {
    const [fxRes, cryptoRes] = await Promise.all([
      fetch("https://api.exchangerate.host/latest?base=USD&symbols=NGN"),
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd"),
    ]);
    const fx = await fxRes.json();
    const crypto = await cryptoRes.json();
    const ngn = Number(fx?.rates?.NGN);
    const btcUsd = Number(crypto?.bitcoin?.usd);
    const ethUsd = Number(crypto?.ethereum?.usd);
    return {
      NGN: ngn && isFinite(ngn) ? ngn : fallback.NGN,
      BTC: btcUsd && isFinite(btcUsd) ? 1 / btcUsd : fallback.BTC,
      ETH: ethUsd && isFinite(ethUsd) ? 1 / ethUsd : fallback.ETH,
    };
  } catch {
    return fallback;
  }
};

export const toUsd = (currency: Currency, amount: number, rates: UsdRates): number => {
  switch (currency) {
    case "USD":
    case "USDT":
      return amount;
    case "NGN":
      return amount / rates.NGN;
    case "BTC":
      return amount / rates.BTC;
    case "ETH":
      return amount / rates.ETH;
  }
};
