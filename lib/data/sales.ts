import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export type SaleWithRelations = {
  id: string
  quantity: number
  total_amount: number
  sale_date: string
  created_at: string
  products: { name: string } | null
  clients: { name: string } | null
}

export async function fetchSales(): Promise<SaleWithRelations[]> {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase
    .from("sales")
    .select(`
      id,
      quantity,
      total_amount,
      sale_date,
      created_at,
      products(name),
      clients(name)
    `)
    .order("sale_date", { ascending: false })

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch sales.")
  }

  return data as SaleWithRelations[]
}

export async function fetchSaleById(id: string) {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.from("sales").select("*").eq("id", id).single()

  if (error) {
    console.error("Database Error:", error)
    return null
  }

  return data
}
