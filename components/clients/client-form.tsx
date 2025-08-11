"use client"

import { useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { toast } from "sonner"
import { createClient, updateClient, type State } from "@/app/clients/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Client } from "@/lib/supabase/types"

export default function ClientForm({ client }: { client?: Client }) {
  const initialState: State = { message: null, errors: {} }
  const action = client ? updateClient.bind(null, client.id) : createClient
  const [state, dispatch] = useFormState(action, initialState)

  useEffect(() => {
    if (state.message) {
      if (state.success === false) {
        toast.error(state.message)
      } else {
        toast.success(state.message)
      }
    }
  }, [state])

  return (
    <form action={dispatch} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            name="first_name"
            defaultValue={client?.first_name}
            aria-describedby="first_name-error"
          />
          <div id="first_name-error" aria-live="polite" aria-atomic="true">
            {state.errors?.first_name &&
              state.errors.first_name.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input id="last_name" name="last_name" defaultValue={client?.last_name} aria-describedby="last_name-error" />
          <div id="last_name-error" aria-live="polite" aria-atomic="true">
            {state.errors?.last_name &&
              state.errors.last_name.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={client?.email ?? ""} aria-describedby="email-error" />
        <div id="email-error" aria-live="polite" aria-atomic="true">
          {state.errors?.email &&
            state.errors.email.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={client?.phone ?? ""} aria-describedby="phone-error" />
        <div id="phone-error" aria-live="polite" aria-atomic="true">
          {state.errors?.phone &&
            state.errors.phone.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" name="address" defaultValue={client?.address ?? ""} aria-describedby="address-error" />
        <div id="address-error" aria-live="polite" aria-atomic="true">
          {state.errors?.address &&
            state.errors.address.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>
      <SubmitButton isEditing={!!client} />
    </form>
  )
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Client" : "Create Client"}
    </Button>
  )
}
