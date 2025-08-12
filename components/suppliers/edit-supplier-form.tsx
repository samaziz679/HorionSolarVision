"use client"

import type React from "react"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { updateSupplier } from "@/app/suppliers/actions"
import type { Supplier } from "@/lib/supabase/types"

export function EditSupplierForm({ supplier }: { supplier: Supplier }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    const formData = new FormData(event.currentTarget)

    await updateSupplier(supplier.id, { success: false }, formData)
    // Note: redirect() in server actions will handle navigation
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ... existing form fields ... */}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? "Updating..." : "Update Supplier"}
      </Button>
    </form>
  )
}
