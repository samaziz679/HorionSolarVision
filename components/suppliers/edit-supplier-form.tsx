"use client"

import { useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { updateSupplier } from "@/app/suppliers/actions"
import type { Supplier } from "@/lib/supabase/types"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? "Updating..." : "Update Supplier"}
    </Button>
  )
}

export function EditSupplierForm({ supplier }: { supplier: Supplier }) {
  const [state, formAction] = useFormState(updateSupplier.bind(null, supplier.id), { message: null, errors: {} })

  useEffect(() => {
    if (state?.message) {
      if (Object.keys(state.errors ?? {}).length > 0) {
        toast.error(state.message)
      } else {
        toast.success(state.message)
      }
    }
  }, [state])

  return (
    <form action={formAction} className="space-y-4">
      {/* ... existing form fields ... */}

      <SubmitButton />
    </form>
  )
}
