"use server"

import { put } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import { writeFile } from "fs/promises"
import { join } from "path"

export async function updateCompanySettings(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const tagline = formData.get("tagline") as string
    const currency = formData.get("currency") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const address = formData.get("address") as string
    const logoFile = formData.get("logo") as File

    let logoUrl = "/images/company/logo.png" // Default logo path

    // Handle logo upload if provided
    if (logoFile && logoFile.size > 0) {
      try {
        // Upload to Vercel Blob
        const blob = await put(`company/logo-${Date.now()}.${logoFile.name.split(".").pop()}`, logoFile, {
          access: "public",
        })
        logoUrl = blob.url
      } catch (error) {
        console.error("Error uploading logo:", error)
        // Continue with default logo if upload fails
      }
    }

    // Update the company config file
    const configContent = `export const companyConfig = {
  name: "${name}",
  tagline: "${tagline}",
  logo: "${logoUrl}",
  currency: "${currency}",
  contact: {
    email: "${email}",
    phone: "${phone}",
    address: "${address}",
  },
  theme: {
    primary: "hsl(24, 95%, 53%)", // Solar orange
    secondary: "hsl(197, 71%, 73%)", // Sky blue
    accent: "hsl(45, 93%, 58%)", // Solar yellow
  },
}`

    // Write to the config file
    const configPath = join(process.cwd(), "lib/config/company.ts")
    await writeFile(configPath, configContent, "utf8")

    revalidatePath("/")
    revalidatePath("/settings")

    return { success: true }
  } catch (error) {
    console.error("Error updating company settings:", error)
    return { success: false, error: "Erreur lors de la mise à jour des paramètres" }
  }
}
