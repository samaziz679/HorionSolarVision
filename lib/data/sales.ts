import "server-only"
import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export async function fetchSales() {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase
    .from("sales")
    .select(`
      id,
      sale_date,
      total_amount,
      clients (
        first_name,
        last_name
      )
    `)
    .order("sale_date", { ascending: false })

  if (error) {
    console.error("Error fetching sales:", error)
    throw new Error("Failed to fetch sales.")
  }

  return data.map((sale) => ({
    ...sale,
    client_name: sale.clients ? `${sale.clients.first_name} ${sale.clients.last_name}` : "N/A",
  }))
}

export async function fetchSaleById(id: number) {
  noStore()
  if (isNaN(id)) return null

  const supabase = createClient()
  const { data, error } = await supabase
    .from("sales")
    .select(`
      *,
      sale_items (
        *,
        products(*)
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error(`Error fetching sale with id ${id}:`, error)
    if (error.code === "PGRST116") {
      return null
    }
    throw new Error("Failed to fetch sale.")
  }

  return data
}
