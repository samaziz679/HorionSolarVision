"use client"

import type React from "react"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { createClient, updateClient } from "@/app/clients/actions"
import { Button } from "@/components/ui/button"
import type { Client } from "@/lib/supabase/types"

export default function ClientForm({ client }: { client?: Client }) {
  const [isLoading, setIsLoading] = useState(false)

  const splitName = (fullName: string) => {
    const parts = fullName.trim().split(" ")
    return {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
    }
  }

  const clientName = client?.name ? splitName(client.name) : { firstName: "", lastName: "" }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    const formData = new FormData(event.currentTarget)

    if (client) {
      await updateClient(client.id, formData)
    } else {
      await createClient(formData)
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
      {/* ... existing form fields ... */}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? (client ? "Updating..." : "Creating...") : client ? "Update Client" : "Create Client"}
      </Button>
    </form>
  )
}
