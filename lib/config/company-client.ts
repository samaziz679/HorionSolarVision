import { createClient } from "@/lib/supabase/client"

export interface CompanyConfig {
  name: string
  tagline: string
  currency: string
  logo?: string
  contact: {
    email: string
    phone: string
    address: string
  }
}

const defaultConfig: CompanyConfig = {
  name: "Solar Vision ERP",
  tagline: "Bienvenue dans le système ERP Solar Vision",
  currency: "FCFA",
  contact: {
    email: "contact@solarvision.bf",
    phone: "+226 70 12 34 56",
    address: "Ouagadougou, Burkina Faso",
  },
}

export async function getCompanyConfigClient(): Promise<CompanyConfig> {
  if (typeof window === "undefined") {
    console.log("Server-side detected, returning default config")
    return defaultConfig
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("company_settings").select("*").single()

    console.log("Company settings query result:", { data, error })

    if (error || !data) {
      console.log("Using default config because:", error?.message || "No data found")
      return defaultConfig
    }

    const config = {
      name: data.company_name || defaultConfig.name,
      tagline: data.tagline || defaultConfig.tagline,
      currency: data.currency || defaultConfig.currency,
      logo: data.logo_url || undefined,
      contact: {
        email: data.email || defaultConfig.contact.email,
        phone: data.phone || defaultConfig.contact.phone,
        address: data.address || defaultConfig.contact.address,
      },
    }

    console.log("Returning company config:", config)
    return config
  } catch (error) {
    console.error("Error fetching company config:", error)
    return defaultConfig
  }
}
