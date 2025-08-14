"use server"

import { put } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function updateCompanySettings(formData: FormData) {
  try {
    const supabase = createClient()

    const name = formData.get("name") as string
    const tagline = formData.get("tagline") as string
    const currency = formData.get("currency") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const address = formData.get("address") as string
    const logoFile = formData.get("logo") as File

    // Get current settings to preserve logo if not updating
    const { data: currentSettings } = await supabase.from("company_settings").select("logo").single()

    let logoUrl = currentSettings?.logo || "/images/company/logo.png"

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
        // Continue with current logo if upload fails
      }
    }

    // Update or insert company settings
    const { error } = await supabase.from("company_settings").upsert({
      name,
      tagline,
      logo: logoUrl,
      currency,
      email,
      phone,
      address,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Database error:", error)
      return { success: false, error: "Erreur lors de la mise à jour des paramètres" }
    }

    revalidatePath("/")
    revalidatePath("/settings")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error updating company settings:", error)
    return { success: false, error: "Erreur lors de la mise à jour des paramètres" }
  }
}
