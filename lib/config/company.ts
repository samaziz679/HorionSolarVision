export const companyConfig = {
  // Company Information
  name: "Solar Vision ERP",
  fullName: "Solar Vision - Système de Gestion d'Entreprise",
  tagline: "Bienvenue dans le système ERP Solar Vision",

  // Branding
  logo: "/images/company/logo.png", // Place your logo here
  favicon: "/favicon.ico",

  // Contact Information
  contact: {
    email: "contact@solarvision.bf",
    phone: "+226 XX XX XX XX",
    address: "Ouagadougou, Burkina Faso",
  },

  // Business Settings
  currency: "FCFA",
  defaultLanguage: "fr",

  // Theme Colors (can be customized per company)
  theme: {
    primary: "rgb(251 146 60)", // Solar orange
    secondary: "rgb(14 165 233)", // Sky blue
    accent: "rgb(250 204 21)", // Solar yellow
    success: "rgb(34 197 94)",
    warning: "rgb(251 146 60)",
    error: "rgb(239 68 68)",
  },
}

// Helper function to get company config
export const getCompanyConfig = () => companyConfig

// Helper function to update company config (for admin settings)
export const updateCompanyConfig = (updates: Partial<typeof companyConfig>) => {
  Object.assign(companyConfig, updates)
}
