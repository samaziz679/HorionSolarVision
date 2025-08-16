"use client"
import { useFormState, useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"
import { createSupplier, updateSupplier } from "@/app/suppliers/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Supplier } from "@/lib/supabase/types"

function SubmitButton({ supplier }: { supplier?: Supplier }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending
        ? supplier
          ? "Mise à jour..."
          : "Création..."
        : supplier
          ? "Mettre à jour le Fournisseur"
          : "Créer le Fournisseur"}
    </Button>
  )
}

export default function SupplierForm({ supplier }: { supplier?: Supplier }) {
  const [state, formAction] = useFormState(supplier ? updateSupplier.bind(null, supplier.id) : createSupplier, {
    success: false,
  })

  const renderErrors = (errors: string[] | undefined) => {
    if (!errors || !Array.isArray(errors)) return null
    return errors.map((error: string) => (
      <p className="mt-2 text-sm text-red-500" key={error}>
        {error}
      </p>
    ))
  }

  return (
    <div>
      {state?.message && (
        <div
          className={`mb-4 p-3 rounded ${state.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-4">
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
          {renderErrors(state?.errors?.name)}
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
          {renderErrors(state?.errors?.contact_person)}
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
          {renderErrors(state?.errors?.email)}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={supplier?.phone || ""}
            placeholder="+226 XX XX XX XX"
          />
          {renderErrors(state?.errors?.phone)}
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
          {renderErrors(state?.errors?.address)}
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
          {renderErrors(state?.errors?.notes)}
        </div>

        <SubmitButton supplier={supplier} />
      </form>
    </div>
  )
}
