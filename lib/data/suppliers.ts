// v2.0 Final
import "server-only"
import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import type { Supplier } from "@/lib/supabase/types"

export async function fetchSuppliers(): Promise<Supplier[]> {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.from("suppliers").select("*").order("name", { ascending: true })

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch suppliers.")
  }

  return data || []
}

export async function fetchSupplierById(id: string): Promise<Supplier | null> {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.from("suppliers").select("*").eq("id", id).single()

  if (error) {
    console.error("Database Error:", error)
    return null
  }

  return data
}

export async function fetchSupplierOptions() {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.from("suppliers").select("id, name").order("name")

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch supplier options.")
  }
  return data || []
}
