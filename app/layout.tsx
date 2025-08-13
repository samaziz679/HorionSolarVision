import type React from "react"
import type { Metadata } from "next"
import "./globals.css" // Import globals.css at the top of the file

export const metadata: Metadata = {
  title: "Solar Vision ERP",
  description: "Manage your solar business with ease.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
