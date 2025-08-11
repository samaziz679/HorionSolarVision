"use client"

import { useFormState, useFormStatus } from "react-dom"
import { useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateSupplier } from "@/app/suppliers/actions"
import type { Supplier } from "@/lib/supabase/types"

const initialState = {
  message: null,
  errors: {},
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Updating Supplier..." : "Update Supplier"}
    </Button>
  )
}

export function EditSupplierForm({ supplier }: { supplier: Supplier }) {
  const updateSupplierWithId = updateSupplier.bind(null, String(supplier.id))
  const [state, dispatch] = useFormState(updateSupplierWithId, initialState)

  useEffect(() => {
    if (state?.message) {
      if (Object.keys(state.errors ?? {}).length > 0) {
        toast.error(state.message)
      } else {
        toast.success(state.message)
      }
    }
  }, [state])

  return (
    <form action={dispatch} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Supplier Name</Label>
        <Input id="name" name="name" type="text" defaultValue={supplier.name} required />
        {state?.errors?.name && <p className="text-sm font-medium text-destructive">{state.errors.name[0]}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contact_person">Contact Person</Label>
        <Input id="contact_person" name="contact_person" type="text" defaultValue={supplier.contact_person ?? ""} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={supplier.email ?? ""} />
        {state?.errors?.email && <p className="text-sm font-medium text-destructive">{state.errors.email[0]}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="phone_number">Phone Number</Label>
        <Input id="phone_number" name="phone_number" type="tel" defaultValue={supplier.phone_number ?? ""} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" name="address" defaultValue={supplier.address ?? ""} />
      </div>

      <SubmitButton />
    </form>
  )
}
