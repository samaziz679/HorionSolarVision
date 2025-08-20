import { createSupabaseServerClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import type { SaleWithDetails } from "@/lib/supabase/types"

export async function fetchSales(page = 1, limit = 10) {
  noStore()
  const supabase = await createSupabaseServerClient()

  // Calculate offset for pagination
  const offset = (page - 1) * limit

  // Get total count for pagination info
  const { count } = await supabase.from("sales").select("*", { count: "exact", head: true })

  const { data, error } = await supabase
    .from("sales")
    .select(
      `
      id,
      sale_date,
      total_price,
      clients (id, name)
    `,
    )
    .order("sale_date", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch sales.")
  }

  const totalPages = Math.ceil((count || 0) / limit)

  const salesData = data.map((sale) => ({
    id: sale.id,
    date: sale.sale_date,
    total_amount: sale.total_price,
    client_name: sale.clients?.name || "N/A",
  }))

  return {
    sales: salesData,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    totalCount: count || 0,
  }
}

export async function fetchSaleById(id: string) {
  noStore()
  if (!id) return null

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("sales")
    .select(
      `
      *,
      clients (*),
      products (*)
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
