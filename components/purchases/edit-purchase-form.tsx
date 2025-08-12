"use client"
import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { updatePurchase } from "@/app/purchases/actions"
import { Loader2 } from "lucide-react"

import type { Product, Supplier, PurchaseWithItems } from "@/lib/supabase/types"

export function EditPurchaseForm({
  purchase,
  products,
  suppliers,
}: {
  purchase: PurchaseWithItems
  products: Product[]
  suppliers: Supplier[]
}) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    const formData = new FormData(event.currentTarget)

    await updatePurchase(purchase.id, { success: false }, formData)
    // Note: redirect() in server actions will handle navigation
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* ... existing form fields ... */}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? "Updating..." : "Update Purchase"}
      </Button>
    </form>
  )
}
