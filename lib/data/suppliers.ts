import "server-only"
import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import type { Supplier } from "@/lib/supabase/types"

export async function fetchSuppliers(): Promise<Supplier[]> {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.from("suppliers").select("*").order("name", { ascending: true })

  if (error) {
    console.error("Error fetching suppliers:", error)
    throw new Error("Failed to fetch suppliers.")
  }

  return data || []
}
