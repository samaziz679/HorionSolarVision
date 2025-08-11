"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { createSupplier, updateSupplier, type State } from "@/app/suppliers/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Supplier } from "@/lib/supabase/types"

export default function SupplierForm({ supplier }: { supplier?: Supplier }) {
  const [state, setState] = useState<State>({ message: null, errors: {} })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setState({ message: null, errors: {} })

    try {
      const action = supplier ? updateSupplier.bind(null, supplier.id) : createSupplier
      const result = await action(state, formData)
      setState(result)
    } catch (error) {
      setState({ message: "An error occurred", errors: {} })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (state.message) {
      if (state.success === false) {
        toast.error(state.message)
      } else if (state.success === true) {
        toast.success(state.message)
      }
    }
  }, [state])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit(new FormData(e.currentTarget))
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Supplier Name</Label>
        <Input id="name" name="name" defaultValue={supplier?.name ?? ""} aria-describedby="name-error" />
        <div id="name-error" aria-live="polite" aria-atomic="true">
          {state.errors?.name &&
            state.errors.name.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact_person">Contact Person</Label>
        <Input
          id="contact_person"
          name="contact_person"
          defaultValue={supplier?.contact_person ?? ""}
          aria-describedby="contact_person-error"
        />
        <div id="contact_person-error" aria-live="polite" aria-atomic="true">
          {state.errors?.contact_person &&
            state.errors.contact_person.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={supplier?.email ?? ""}
          aria-describedby="email-error"
        />
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
        <Label htmlFor="phone_number">Phone</Label>
        <Input
          id="phone_number"
          name="phone_number"
          defaultValue={supplier?.phone_number ?? ""}
          aria-describedby="phone_number-error"
        />
        <div id="phone_number-error" aria-live="polite" aria-atomic="true">
          {state.errors?.phone_number &&
            state.errors.phone_number.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" name="address" defaultValue={supplier?.address ?? ""} aria-describedby="address-error" />
        <div id="address-error" aria-live="polite" aria-atomic="true">
          {state.errors?.address &&
            state.errors.address.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>
      <SubmitButton isEditing={!!supplier} isLoading={isLoading} />
    </form>
  )
}

function SubmitButton({ isEditing, isLoading }: { isEditing: boolean; isLoading: boolean }) {
  return (
    <Button type="submit" disabled={isLoading} className="w-full">
      {isLoading ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Supplier" : "Create Supplier"}
    </Button>
  )
}
