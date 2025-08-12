"use client"

import { useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { createClient, updateClient } from "@/app/clients/actions"
import { Button } from "@/components/ui/button"
import type { Client } from "@/lib/supabase/types"

export default function ClientForm({ client }: { client?: Client }) {
  const action = client ? updateClient.bind(null, client.id) : createClient
  const [state, formAction] = useFormState(action, { message: null, errors: {} })

  const splitName = (fullName: string) => {
    const parts = fullName.trim().split(" ")
    return {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
    }
  }

  const clientName = client?.name ? splitName(client.name) : { firstName: "", lastName: "" }

  useEffect(() => {
    if (state.message) {
      if (state.success === false) {
        toast.error(state.message)
      } else if (state.success === true) {
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
    <form action={formAction} className="space-y-4">
      {/* ... existing form fields ... */}

      <SubmitButton isEditing={!!client} />
    </form>
  )
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Client" : "Create Client"}
    </Button>
  )
}
