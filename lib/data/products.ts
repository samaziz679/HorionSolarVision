import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export type ProductOption = {
  id: string
  name: string
}

export async function fetchProductOptions(): Promise<ProductOption[]> {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.from("products").select("id, name").order("name", { ascending: true })

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch product options.")
  }

  return data || []
}
