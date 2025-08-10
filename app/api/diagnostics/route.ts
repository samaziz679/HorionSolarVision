import { NextResponse } from "next/server"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getAdminClient } from "@/lib/supabase/admin"

type CheckResult<T = unknown> = {
  ok: boolean
  error: string | null
  sample: T | null
}

// Helper to probe a table with loose typing for diagnostics only.
async function checkTable(supabase: SupabaseClient<any>, table: string): Promise<CheckResult<{ id: string }>> {
  try {
    const { data, error } = await supabase.from(table).select("id").limit(1)
    if (error) return { ok: false, error: error.message, sample: null }
    return { ok: true, error: null, sample: data && data[0] ? { id: String(data[0].id) } : null }
  } catch (e: any) {
    return { ok: false, error: String(e?.message ?? e), sample: null }
  }
}

// Helper to probe a view with loose typing for diagnostics only.
async function checkView(supabase: SupabaseClient<any>, view: string): Promise<CheckResult<{ id: string }>> {
  try {
    const { data, error } = await supabase.from(view).select("id").limit(1)
    if (error) return { ok: false, error: error.message, sample: null }
    return { ok: true, error: null, sample: data && data[0] ? { id: String(data[0].id) } : null }
  } catch (e: any) {
    return { ok: false, error: String(e?.message ?? e), sample: null }
  }
}

export async function GET() {
  const supabase = getAdminClient() as SupabaseClient<any>

  const [products, purchases, sales, expenses, bankEntries, bankingAccounts] = await Promise.all([
    checkTable(supabase, "products"),
    checkTable(supabase, "purchases"),
    checkTable(supabase, "sales"),
    checkTable(supabase, "expenses"),
    checkTable(supabase, "bank_entries"), // your live DB uses bank_entries
    checkTable(supabase, "banking_accounts"), // legacy check (may be absent)
  ])

  const [currentStock, financialSummary, totalSalesPerProduct] = await Promise.all([
    checkView(supabase, "current_stock"),
    checkView(supabase, "financial_summary"),
    checkView(supabase, "total_sales_per_product"),
  ])

  const payload = {
    timestamp: new Date().toISOString(),
    env: {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    checks: {
      tables: {
        products,
        purchases,
        sales,
        expenses,
        bank_entries: bankEntries,
        banking_accounts: bankingAccounts,
      },
      views: {
        current_stock: currentStock,
        financial_summary: financialSummary,
        total_sales_per_product: totalSalesPerProduct,
      },
      rscClientCheck: { ok: true, error: null },
    },
  }

  return NextResponse.json(payload, { status: 200 })
}
