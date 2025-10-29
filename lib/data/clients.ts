import { createSupabaseServerClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import type { Client } from "@/lib/supabase/types"

export async function fetchClients() {
  noStore()
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch clients.")
  }

  return data as Client[]
}

export async function fetchClientById(id: string) {
  noStore()
  if (!id) return null

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("clients").select("*").eq("id", id).single()

  if (error) {
    console.error("Database Error:", error)
    // Don't throw for single record not found, page will show 404
    return null
  }

  return data as Client | null
}

export async function fetchClientsForForm() {
  noStore()
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("clients").select("id, name")

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch clients for form.")
  }

  return data
}
