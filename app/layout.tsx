import type React from "react"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { CompanyProvider } from "@/components/providers/company-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Solar Vision ERP",
  description: "Système de gestion d'entreprise",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <CompanyProvider>{children}</CompanyProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
