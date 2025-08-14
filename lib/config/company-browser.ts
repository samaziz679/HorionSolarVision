import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export interface CompanyConfig {
  name: string
  slogan: string
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
  slogan: "Bienvenue dans le système ERP Solar Vision",
  currency: "FCFA",
  contact: {
    email: "contact@solarvision.bf",
    phone: "+226 64 25 88 88",
    address: "Ouagadougou, Burkina Faso",
  },
}

export async function getCompanyConfigBrowser(): Promise<CompanyConfig> {
  if (typeof window === "undefined") {
    return defaultConfig
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data, error } = await supabase.from("company_settings").select("*").single()

    if (error || !data) {
      console.log("No company settings found, using defaults")
      return defaultConfig
    }

    return {
      name: data.company_name || defaultConfig.name,
      slogan: data.slogan || defaultConfig.slogan,
      currency: data.currency || defaultConfig.currency,
      logo: data.logo_url || undefined,
      contact: {
        email: data.email || defaultConfig.contact.email,
        phone: data.phone || defaultConfig.contact.phone,
        address: data.address || defaultConfig.contact.address,
      },
    }
  } catch (error) {
    console.error("Error fetching company config:", error)
    return defaultConfig
  }
}
