// v2.0 Final
import "server-only"
import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import type { Client } from "@/lib/supabase/types"

export async function fetchClients(): Promise<Client[]> {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.from("clients").select("*").order("last_name", { ascending: true })

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch clients.")
  }

  return data || []
}

export async function fetchClientById(id: string): Promise<Client | null> {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.from("clients").select("*").eq("id", id).single()

  if (error) {
    console.error("Database Error:", error)
    return null
  }

  return data
}
