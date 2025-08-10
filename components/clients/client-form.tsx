"use client"

import { useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createClientAction, updateClientAction, type State } from "@/app/clients/actions"
import type { Client } from "@/lib/supabase/types"

function SubmitButton({ isUpdate }: { isUpdate: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (isUpdate ? "Updating..." : "Creating...") : isUpdate ? "Update Client" : "Create Client"}
    </Button>
  )
}

export default function ClientForm({ client }: { client?: Client }) {
  const initialState: State = { message: null, errors: {}, success: false }
  const action = client ? updateClientAction.bind(null, client.id) : createClientAction
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input id="first_name" name="first_name" defaultValue={client?.first_name} required />
          {state.errors?.first_name && <p className="text-sm text-red-500">{state.errors.first_name[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input id="last_name" name="last_name" defaultValue={client?.last_name} required />
          {state.errors?.last_name && <p className="text-sm text-red-500">{state.errors.last_name[0]}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={client?.email ?? ""} />
        {state.errors?.email && <p className="text-sm text-red-500">{state.errors.email[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={client?.phone ?? ""} />
        {state.errors?.phone && <p className="text-sm text-red-500">{state.errors.phone[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" defaultValue={client?.address ?? ""} />
        {state.errors?.address && <p className="text-sm text-red-500">{state.errors.address[0]}</p>}
      </div>
      <SubmitButton isUpdate={!!client} />
    </form>
  )
}
