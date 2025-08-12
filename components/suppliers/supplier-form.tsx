"use client"

import type React from "react"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { createSupplier, updateSupplier } from "@/app/suppliers/actions"
import { Button } from "@/components/ui/button"
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
      {/* ... existing form fields ... */}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? (supplier ? "Updating..." : "Creating...") : supplier ? "Update Supplier" : "Create Supplier"}
      </Button>
    </form>
  )
}
