import { createClient } from "@/lib/supabase/server"

// Default company configuration (fallback values)
const defaultConfig = {
  name: "Solar Vision ERP",
  fullName: "Solar Vision - Système de Gestion d'Entreprise",
  tagline: "Bienvenue dans le système ERP Solar Vision",
  logo: "/images/company/logo.png",
  favicon: "/favicon.ico",
  contact: {
    email: "contact@solarvision.bf",
    phone: "+226 XX XX XX XX",
    address: "Ouagadougou, Burkina Faso",
  },
  currency: "FCFA",
  defaultLanguage: "fr",
  theme: {
    primary: "rgb(251 146 60)", // Solar orange
    secondary: "rgb(14 165 233)", // Sky blue
    accent: "rgb(250 204 21)", // Solar yellow
    success: "rgb(34 197 94)",
    warning: "rgb(251 146 60)",
    error: "rgb(239 68 68)",
  },
}

export async function getCompanyConfig() {
  try {
    const supabase = createClient()
    const { data: settings } = await supabase.from("company_settings").select("*").single()

    if (settings) {
      return {
        ...defaultConfig,
        name: settings.name,
        tagline: settings.tagline,
        logo: settings.logo,
        currency: settings.currency,
        contact: {
          email: settings.email,
          phone: settings.phone,
          address: settings.address,
        },
        theme: {
          ...defaultConfig.theme,
          primary: settings.theme_primary || defaultConfig.theme.primary,
          secondary: settings.theme_secondary || defaultConfig.theme.secondary,
          accent: settings.theme_accent || defaultConfig.theme.accent,
        },
      }
    }
  } catch (error) {
    console.error("Error fetching company config:", error)
  }

  return defaultConfig
}

export const companyConfig = defaultConfig
