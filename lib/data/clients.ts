import "server-only"
import { unstable_noStore as noStore } from "next/cache"
import { getAdminClient } from "@/lib/supabase/admin"
import type { Client } from "@/lib/supabase/types"

export type ClientOption = Pick<Client, "id" | "name">

export async function fetchClients(): Promise<Client[]> {
  noStore()
  const supabase = getAdminClient()
  const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Database Error (fetchClients):", error)
    throw new Error("Failed to fetch clients.")
  }

  return (data ?? []) as Client[]
}

export async function fetchClientById(id: string): Promise<Client | null> {
  noStore()
  const supabase = getAdminClient()
  const { data, error } = await supabase.from("clients").select("*").eq("id", id).single()

  if (error) {
    if (error.code === "PGRST116") return null
    console.error("Database Error (fetchClientById):", error)
    throw new Error("Failed to fetch client.")
  }

  return (data ?? null) as Client | null
}

export async function fetchClientOptions(): Promise<ClientOption[]> {
  noStore()
  const supabase = getAdminClient()
  const { data, error } = await supabase.from("clients").select("id, name").order("name", { ascending: true })

  if (error) {
    console.error("Database Error (fetchClientOptions):", error)
    throw new Error("Failed to fetch client options.")
  }

  return (data ?? []).map((c) => ({ ...c, id: String(c.id), name: c.name ?? "" }))
}
