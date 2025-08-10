/**
 * Currency helpers for XOF and RMB (CNY).
 * - Default currency is XOF unless NEXT_PUBLIC_CURRENCY is set to "CNY" or "XOF".
 * - XOF is formatted with 0 fraction digits; CNY with 2.
 */

export type SupportedCurrency = "XOF" | "CNY"

export function getActiveCurrency(): SupportedCurrency {
  const v = (process.env.NEXT_PUBLIC_CURRENCY || "").toUpperCase()
  if (v === "CNY" || v === "RMB") return "CNY"
  if (v === "XOF") return "XOF"
  // default
  return "XOF"
}

function formatterFor(currency: SupportedCurrency) {
  const base: Intl.NumberFormatOptions = {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
  }
  if (currency === "XOF") {
    base.minimumFractionDigits = 0
    base.maximumFractionDigits = 0
  } else {
    // CNY
    base.minimumFractionDigits = 2
    base.maximumFractionDigits = 2
  }
  return new Intl.NumberFormat(undefined, base)
}

/**
 * Formats a numeric value using the active currency (XOF/CNY).
 */
export function formatMoney(
  value: number | string | null | undefined,
  currency: SupportedCurrency = getActiveCurrency(),
): string {
  const n = Number(value)
  if (!Number.isFinite(n)) return ""
  return formatterFor(currency).format(n)
}

/**
 * Alias used in some files.
 */
export const formatCurrency = formatMoney

/**
 * Formats without the currency symbol (just the number with proper fraction digits).
 */
export function formatAmount(
  value: number | string | null | undefined,
  currency: SupportedCurrency = getActiveCurrency(),
): string {
  const n = Number(value)
  if (!Number.isFinite(n)) return ""
  const opts: Intl.NumberFormatOptions = {
    minimumFractionDigits: currency === "XOF" ? 0 : 2,
    maximumFractionDigits: currency === "XOF" ? 0 : 2,
  }
  return new Intl.NumberFormat(undefined, opts).format(n)
}
