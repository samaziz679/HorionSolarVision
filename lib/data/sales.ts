import "server-only"
import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import type { SaleWithItems } from "@/lib/supabase/types"

export async function fetchSales() {
  noStore()
  const supabase = createClient()
  // This query explicitly joins the clients table and selects the first and last names.
  const { data, error } = await supabase
    .from("sales")
    .select(`
      id,
      date,
      total_amount,
      clients (
        first_name,
        last_name
      )
    `)
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching sales:", error)
    throw new Error("Failed to fetch sales.")
  }

  // We now manually create the 'client_name' property in the application code.
  // This makes the component's job easier and isolates the data transformation logic here.
  return data.map((sale) => ({
    ...sale,
    client_name: sale.clients ? `${sale.clients.first_name} ${sale.clients.last_name}`.trim() : "N/A",
  }))
}

export async function fetchSaleById(id: number): Promise<SaleWithItems | null> {
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
