import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export type SupplierOption = {
  id: string
  name: string
}

export async function fetchSupplierOptions(): Promise<SupplierOption[]> {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.from("suppliers").select("id, name").order("name", { ascending: true })

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch supplier options.")
  }

  return data || []
}
