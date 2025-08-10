import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export type ClientOption = {
  id: string
  name: string
}

export async function fetchClientOptions(): Promise<ClientOption[]> {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.from("clients").select("id, name").order("name", { ascending: true })

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch client options.")
  }

  return data || []
}

export type Client = {
  id: string
  name: string
  contact_person: string | null
  email: string | null
  phone_number: string | null
  address: string | null
  created_at: string
}

export async function fetchClients(): Promise<Client[]> {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.from("clients").select("*").order("name", { ascending: true })

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
