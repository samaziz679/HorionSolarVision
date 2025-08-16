"use client"

import type React from "react"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { createSupplier, updateSupplier } from "@/app/suppliers/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Supplier } from "@/lib/supabase/types"

export default function SupplierForm({ supplier }: { supplier?: Supplier }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    const formData = new FormData(event.currentTarget)

    if (supplier) {
      await updateSupplier(supplier.id, { success: false }, formData)
    } else {
      await createSupplier({ success: false }, formData)
    }
    // Note: redirect() in server actions will handle navigation
    setIsLoading(false)
  }

  const renderErrors = (errors: string[] | undefined) => {
    if (!errors || !Array.isArray(errors)) return null
    return errors.map((error: string) => (
      <p className="mt-2 text-sm text-red-500" key={error}>
        {error}
      </p>
    ))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom du Fournisseur</Label>
        <Input
          id="name"
          name="name"
          type="text"
          defaultValue={supplier?.name || ""}
          placeholder="Entrez le nom du fournisseur"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact_person">Personne de Contact</Label>
        <Input
          id="contact_person"
          name="contact_person"
          type="text"
          defaultValue={supplier?.contact_person || ""}
          placeholder="Nom de la personne de contact"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={supplier?.email || ""}
          placeholder="email@exemple.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone</Label>
        <Input id="phone" name="phone" type="tel" defaultValue={supplier?.phone || ""} placeholder="+226 XX XX XX XX" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adresse</Label>
        <Textarea
          id="address"
          name="address"
          defaultValue={supplier?.address || ""}
          placeholder="Adresse complète du fournisseur"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optionnelles)</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={supplier?.notes || ""}
          placeholder="Notes supplémentaires sur ce fournisseur"
          rows={3}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading
          ? supplier
            ? "Mise à jour..."
            : "Création..."
          : supplier
            ? "Mettre à jour le Fournisseur"
            : "Créer le Fournisseur"}
      </Button>
    </form>
  )
}
