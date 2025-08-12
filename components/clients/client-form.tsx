"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { createClient, updateClient, type State } from "@/app/clients/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Client } from "@/lib/supabase/types"

export default function ClientForm({ client }: { client?: Client }) {
  const [state, setState] = useState<State>({ message: null, errors: {} })
  const [isLoading, setIsLoading] = useState(false)

  const splitName = (fullName: string) => {
    const parts = fullName.trim().split(" ")
    return {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
    }
  }

  const clientName = client?.name ? splitName(client.name) : { firstName: "", lastName: "" }

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setState({ message: null, errors: {} })

    try {
      const firstName = formData.get("first_name") as string
      const lastName = formData.get("last_name") as string
      const fullName = `${firstName} ${lastName}`.trim()

      // Replace the separate name fields with the combined name
      formData.delete("first_name")
      formData.delete("last_name")
      formData.set("name", fullName)

      const action = client ? updateClient.bind(null, client.id) : createClient
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
      } else {
        toast.success(state.message)
      }
    }
  }, [state])

  const renderErrors = (errors: string[] | undefined) => {
    if (!errors || !Array.isArray(errors)) return null
    return errors.map((error: string) => (
      <p className="mt-2 text-sm text-red-500" key={error}>
        {error}
      </p>
    ))
  }

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        await handleSubmit(formData)
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            name="first_name"
            defaultValue={clientName.firstName}
            aria-describedby="first_name-error"
          />
          <div id="first_name-error" aria-live="polite" aria-atomic="true">
            {renderErrors(state.errors?.name)}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            name="last_name"
            defaultValue={clientName.lastName}
            aria-describedby="last_name-error"
          />
          <div id="last_name-error" aria-live="polite" aria-atomic="true">
            {renderErrors(state.errors?.name)}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={client?.email ?? ""} aria-describedby="email-error" />
        <div id="email-error" aria-live="polite" aria-atomic="true">
          {renderErrors(state.errors?.email)}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={client?.phone ?? ""} aria-describedby="phone-error" />
        <div id="phone-error" aria-live="polite" aria-atomic="true">
          {renderErrors(state.errors?.phone)}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" name="address" defaultValue={client?.address ?? ""} aria-describedby="address-error" />
        <div id="address-error" aria-live="polite" aria-atomic="true">
          {renderErrors(state.errors?.address)}
        </div>
      </div>
      <SubmitButton isEditing={!!client} isLoading={isLoading} />
    </form>
  )
}

function SubmitButton({ isEditing, isLoading }: { isEditing: boolean; isLoading: boolean }) {
  return (
    <Button type="submit" disabled={isLoading} className="w-full">
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Client" : "Create Client"}
    </Button>
  )
}
