import type React from "react"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { getCompanyConfig } from "@/lib/config/company"
import "./globals.css"

const company = getCompanyConfig()

export const metadata: Metadata = {
  title: company.name,
  description: company.tagline,
  generator: "v0.dev",
  icons: {
    icon: company.favicon,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang={company.defaultLanguage} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
