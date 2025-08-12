"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { createPurchase, updatePurchase } from "@/app/purchases/actions"
import { Button } from "@/components/ui/button"
import type { Purchase, Product, Supplier } from "@/lib/supabase/types"

export default function PurchaseForm({
  purchase,
  products,
  suppliers,
}: {
  purchase?: Purchase
  products: Pick<Product, "id" | "name">[]
  suppliers: Pick<Supplier, "id" | "name">[]
}) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    const formData = new FormData(event.currentTarget)

    if (purchase) {
      await updatePurchase(purchase.id, formData)
    } else {
      await createPurchase(formData)
    }
    // Note: redirect() in server actions will handle navigation
    setIsLoading(false)
  }

  useEffect(() => {
    if (purchase) {
      toast.success("Purchase loaded successfully")
    }
  }, [purchase])

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
        {isLoading ? (purchase ? "Updating..." : "Creating...") : purchase ? "Update Purchase" : "Create Purchase"}
      </Button>
    </form>
  )
}
