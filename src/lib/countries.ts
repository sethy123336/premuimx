// Minimal country list with dial code and default fiat currency.
// Extend as needed.
export interface Country {
  name: string;
  code: string; // ISO-2
  dialCode: string;
  currency: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { name: "Nigeria", code: "NG", dialCode: "+234", currency: "NGN", flag: "🇳🇬" },
  { name: "United States", code: "US", dialCode: "+1", currency: "USD", flag: "🇺🇸" },
  { name: "United Kingdom", code: "GB", dialCode: "+44", currency: "GBP", flag: "🇬🇧" },
  { name: "Canada", code: "CA", dialCode: "+1", currency: "CAD", flag: "🇨🇦" },
  { name: "Ghana", code: "GH", dialCode: "+233", currency: "GHS", flag: "🇬🇭" },
  { name: "Kenya", code: "KE", dialCode: "+254", currency: "KES", flag: "🇰🇪" },
  { name: "South Africa", code: "ZA", dialCode: "+27", currency: "ZAR", flag: "🇿🇦" },
  { name: "India", code: "IN", dialCode: "+91", currency: "INR", flag: "🇮🇳" },
  { name: "Germany", code: "DE", dialCode: "+49", currency: "EUR", flag: "🇩🇪" },
  { name: "France", code: "FR", dialCode: "+33", currency: "EUR", flag: "🇫🇷" },
  { name: "Spain", code: "ES", dialCode: "+34", currency: "EUR", flag: "🇪🇸" },
  { name: "Italy", code: "IT", dialCode: "+39", currency: "EUR", flag: "🇮🇹" },
  { name: "Netherlands", code: "NL", dialCode: "+31", currency: "EUR", flag: "🇳🇱" },
  { name: "United Arab Emirates", code: "AE", dialCode: "+971", currency: "AED", flag: "🇦🇪" },
  { name: "Australia", code: "AU", dialCode: "+61", currency: "AUD", flag: "🇦🇺" },
  { name: "Brazil", code: "BR", dialCode: "+55", currency: "BRL", flag: "🇧🇷" },
  { name: "Mexico", code: "MX", dialCode: "+52", currency: "MXN", flag: "🇲🇽" },
  { name: "Japan", code: "JP", dialCode: "+81", currency: "JPY", flag: "🇯🇵" },
  { name: "China", code: "CN", dialCode: "+86", currency: "CNY", flag: "🇨🇳" },
  { name: "Singapore", code: "SG", dialCode: "+65", currency: "SGD", flag: "🇸🇬" },
];

export const DEFAULT_COUNTRY = COUNTRIES[0];

export const findCountryByCode = (code?: string | null) =>
  code ? COUNTRIES.find((c) => c.code === code.toUpperCase()) : undefined;

// Auto-detect via free, no-key IP geolocation
export const detectCountry = async (): Promise<Country | null> => {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) return null;
    const data = await res.json();
    return findCountryByCode(data?.country_code) ?? null;
  } catch {
    return null;
  }
};
