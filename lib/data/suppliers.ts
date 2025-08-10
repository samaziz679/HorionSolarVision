import "server-only"
import { unstable_noStore as noStore } from "next/cache"
import { getAdminClient } from "@/lib/supabase/admin"
import type { Supplier } from "@/lib/supabase/types"

export type SupplierOption = Pick<Supplier, "id" | "name">

export async function fetchSuppliers(): Promise<Supplier[]> {
  noStore()
  const supabase = getAdminClient()
  const { data, error } = await supabase.from("suppliers").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Database Error (fetchSuppliers):", error)
    throw new Error("Failed to fetch suppliers.")
  }

  return (data ?? []) as Supplier[]
}

export async function fetchSupplierById(id: string): Promise<Supplier | null> {
  noStore()
  const supabase = getAdminClient()
  const { data, error } = await supabase.from("suppliers").select("*").eq("id", id).single()

  if (error) {
    if (error.code === "PGRST116") return null
    console.error("Database Error (fetchSupplierById):", error)
    throw new Error("Failed to fetch supplier.")
  }

  return (data ?? null) as Supplier | null
}

export async function fetchSupplierOptions(): Promise<SupplierOption[]> {
  noStore()
  const supabase = getAdminClient()
  const { data, error } = await supabase.from("suppliers").select("id, name").order("name", { ascending: true })

  if (error) {
    console.error("Database Error (fetchSupplierOptions):", error)
    throw new Error("Failed to fetch supplier options.")
  }

  return (data ?? []).map((s) => ({ ...s, id: String(s.id), name: s.name ?? "" }))
}
