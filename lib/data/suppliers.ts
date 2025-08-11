import { createSupabaseServerClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import type { Supplier } from "@/lib/supabase/types"

export async function fetchSuppliers() {
  noStore()
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("suppliers").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch suppliers.")
  }

  return data as Supplier[]
}

export async function fetchSupplierById(id: string) {
  noStore()
  if (!id) return null

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("suppliers").select("*").eq("id", id).single()

  if (error) {
    console.error("Database Error:", error)
    return null
  }

  return data as Supplier | null
}

export async function fetchSuppliersForForm() {
  noStore()
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("suppliers").select("id, name")

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch suppliers for form.")
  }

  return data
}
