"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient } from "@supabase/supabase-js"

interface CompanyConfig {
  name: string
  logo: string | null
  slogan: string
  currency: string
  contact: {
    email: string
    phone: string
    address: string
  }
}

const defaultConfig: CompanyConfig = {
  name: "Solar Vision ERP",
  logo: null,
  slogan: "Bienvenue dans le système ERP Solar Vision",
  currency: "FCFA",
  contact: {
    email: "contact@solarvision.com",
    phone: "+226 XX XX XX XX",
    address: "Ouagadougou, Burkina Faso",
  },
}

const CompanyContext = createContext<CompanyConfig>(defaultConfig)

export function useCompany() {
  return useContext(CompanyContext)
}

interface CompanyProviderProps {
  children: ReactNode
}

export function CompanyProvider({ children }: CompanyProviderProps) {
  const [company, setCompany] = useState<CompanyConfig>(defaultConfig)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Only run on client side after hydration
    if (typeof window === "undefined") return

    async function loadCompanyConfig() {
      try {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

        const { data, error } = await supabase.from("company_settings").select("*").single()

        if (error) {
          console.log("No company settings found, using defaults")
          setIsLoaded(true)
          return
        }

        if (data) {
          const config: CompanyConfig = {
            name: data.company_name || defaultConfig.name,
            logo: data.logo_url || defaultConfig.logo,
            slogan: data.slogan || defaultConfig.slogan,
            currency: data.currency || defaultConfig.currency,
            contact: {
              email: data.email || defaultConfig.contact.email,
              phone: data.phone || defaultConfig.contact.phone,
              address: data.address || defaultConfig.contact.address,
            },
          }

          console.log("Loaded company config:", config)
          setCompany(config)
        }
      } catch (error) {
        console.error("Error loading company config:", error)
      } finally {
        setIsLoaded(true)
      }
    }

    loadCompanyConfig()
  }, [])

  return <CompanyContext.Provider value={company}>{children}</CompanyContext.Provider>
}
