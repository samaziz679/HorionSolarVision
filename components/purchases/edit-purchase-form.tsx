"use client"
import { useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { updatePurchase } from "@/app/purchases/actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import type { Product, Supplier, PurchaseWithItems } from "@/lib/supabase/types"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? "Updating..." : "Update Purchase"}
    </Button>
  )
}

export function EditPurchaseForm({
  purchase,
  products,
  suppliers,
}: {
  purchase: PurchaseWithItems
  products: Product[]
  suppliers: Supplier[]
}) {
  const [state, formAction] = useFormState(updatePurchase.bind(null, purchase.id), { message: null, errors: {} })

  useEffect(() => {
    if (state.message) {
      if (Object.keys(state.errors ?? {}).length > 0) {
        toast.error(state.message)
      } else {
        toast.success(state.message)
      }
    }
  }, [state])

  return (
    <form action={formAction}>
      {/* ... existing form fields ... */}

      <SubmitButton />
    </form>
  )
}
