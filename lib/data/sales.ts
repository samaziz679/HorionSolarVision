import { createSupabaseServerClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import type { SaleWithDetails } from "@/lib/supabase/types"

export async function fetchSales() {
  noStore()
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("sales")
    .select(
      `
      id,
      sale_date,
      total_amount,
      created_at,
      products (id, name),
      clients (id, first_name, last_name)
    `,
    )
    .order("sale_date", { ascending: false })

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch sales.")
  }

  return data.map((sale) => ({
    id: sale.id,
    date: sale.sale_date,
    total_amount: sale.total_amount,
    client_name: `${sale.clients.first_name} ${sale.clients.last_name}`.trim(),
  }))
}

export async function fetchSaleById(id: number) {
  noStore()
  if (isNaN(id)) return null

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("sales")
    .select(
      `
      *,
      products (id, name, price),
      clients (id, first_name, last_name)
    `,
    )
    .eq("id", id)
    .single()

  if (error) {
    console.error("Database Error:", error)
    return null
  }

  return data as SaleWithDetails | null
}
