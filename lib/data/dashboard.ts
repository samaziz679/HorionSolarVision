import { unstable_noStore as noStore } from "next/cache"
import { getAdminClient } from "@/lib/supabase/admin"

type AnyRow = Record<string, unknown>

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string") {
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  return null
}

function sumFromRows(rows: AnyRow[], keys: string[]): { sum: number; key?: string } {
  for (const key of keys) {
    let sum = 0
    let hits = 0
    for (const r of rows) {
      const n = num(r?.[key])
      if (n !== null) {
        sum += n
        hits++
      }
    }
    if (hits > 0) return { sum, key }
  }
  return { sum: 0 }
}

/**
 * Prefer your SECURITY DEFINER reporting views, then fall back to base tables.
 * - totalSales: first try financial_summary or total_sales_per_product; else sum common fields in sales.
 * - totalExpenses: try financial_summary; else sum "amount"/"total" in expenses.
 * - totalProducts: try current_stock; else sum products.quantity (matches your schema image).
 */
export async function fetchCardData(): Promise<{
  totalSales: number
  totalExpenses: number
  totalProducts: number
}> {
  noStore()
  const supabase = getAdminClient()

  let totalSales = 0
  let totalExpenses = 0
  let totalProducts = 0

  // SALES
  try {
    const fs = await supabase.from("financial_summary").select("*")
    if (!fs.error && Array.isArray(fs.data) && fs.data.length) {
      totalSales = sumFromRows(fs.data as AnyRow[], ["total_sales", "sales_total", "revenue", "total_revenue"]).sum
    }
    if (!totalSales) {
      const tsp = await supabase.from("total_sales_per_product").select("*")
      if (!tsp.error && Array.isArray(tsp.data) && tsp.data.length) {
        totalSales = sumFromRows(tsp.data as AnyRow[], [
          "total",
          "total_amount",
          "amount",
          "grand_total",
          "total_price",
        ]).sum
      }
    }
    if (!totalSales) {
      const s = await supabase.from("sales").select("*")
      if (!s.error && Array.isArray(s.data)) {
        totalSales = sumFromRows(s.data as AnyRow[], [
          "total",
          "total_amount",
          "amount",
          "grand_total",
          "total_price",
        ]).sum
      }
    }
  } catch (e) {
    console.warn("dashboard sales totals failed:", e)
  }

  // EXPENSES
  try {
    if (!totalExpenses) {
      const fs = await supabase.from("financial_summary").select("*")
      if (!fs.error && Array.isArray(fs.data) && fs.data.length) {
        totalExpenses = sumFromRows(fs.data as AnyRow[], ["total_expenses", "expenses_total", "expenses"]).sum
      }
    }
    if (!totalExpenses) {
      const ex = await supabase.from("expenses").select("*")
      if (!ex.error && Array.isArray(ex.data)) {
        totalExpenses = sumFromRows(ex.data as AnyRow[], ["amount", "total", "value", "expense_amount", "cost"]).sum
      }
    }
  } catch (e) {
    console.warn("dashboard expenses totals failed:", e)
  }

  // PRODUCTS (stock)
  try {
    const cs = await supabase.from("current_stock").select("*")
    if (!cs.error && Array.isArray(cs.data) && cs.data.length) {
      // Some views return a single row; some return per-product. Try both styles.
      const oneRow = cs.data.length === 1
      const keys = oneRow
        ? ["total_stock", "total_quantity", "current_stock"]
        : ["quantity", "stock_quantity", "in_stock", "qty", "stock"]
      totalProducts = sumFromRows(cs.data as AnyRow[], keys).sum
    }
    if (!totalProducts) {
      // Your products table uses "quantity" for current stock (per the schema image).
      const p = await supabase.from("products").select("*")
      if (!p.error && Array.isArray(p.data)) {
        totalProducts = sumFromRows(p.data as AnyRow[], ["quantity", "stock_quantity", "in_stock", "qty", "stock"]).sum
      }
    }
  } catch (e) {
    console.warn("dashboard product totals failed:", e)
  }

  return {
    totalSales: Number.isFinite(totalSales) ? totalSales : 0,
    totalExpenses: Number.isFinite(totalExpenses) ? totalExpenses : 0,
    totalProducts: Number.isFinite(totalProducts) ? totalProducts : 0,
  }
}
