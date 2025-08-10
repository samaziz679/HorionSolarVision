"use client"

import { useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createSupplierAction, updateSupplierAction, type State } from "@/app/suppliers/actions"
import type { Supplier } from "@/lib/supabase/types"

function SubmitButton({ isUpdate }: { isUpdate: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (isUpdate ? "Updating..." : "Creating...") : isUpdate ? "Update Supplier" : "Create Supplier"}
    </Button>
  )
}

export default function SupplierForm({ supplier }: { supplier?: Supplier }) {
  const initialState: State = { message: null, errors: {}, success: false }
  const action = supplier ? updateSupplierAction.bind(null, supplier.id) : createSupplierAction
  const [state, dispatch] = useFormState(action, initialState)

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message)
      } else {
        toast.error(state.message, {
          description: state.errors ? Object.values(state.errors).flat().join("\n") : undefined,
        })
      }
    }
  }, [state])

  return (
    <form action={dispatch} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Supplier Name</Label>
        <Input id="name" name="name" defaultValue={supplier?.name} required />
        {state.errors?.name && <p className="text-sm text-red-500">{state.errors.name[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact_person">Contact Person</Label>
        <Input id="contact_person" name="contact_person" defaultValue={supplier?.contact_person ?? ""} />
        {state.errors?.contact_person && <p className="text-sm text-red-500">{state.errors.contact_person[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={supplier?.email ?? ""} />
        {state.errors?.email && <p className="text-sm text-red-500">{state.errors.email[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={supplier?.phone ?? ""} />
        {state.errors?.phone && <p className="text-sm text-red-500">{state.errors.phone[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" defaultValue={supplier?.address ?? ""} />
        {state.errors?.address && <p className="text-sm text-red-500">{state.errors.address[0]}</p>}
      </div>
      <SubmitButton isUpdate={!!supplier} />
    </form>
  )
}
