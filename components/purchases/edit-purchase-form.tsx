"use client"
import { useFormState, useFormStatus } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updatePurchase } from "@/app/purchases/actions"
import { toast } from "sonner"
import { useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import type { Product, Supplier, PurchaseWithItems } from "@/lib/supabase/types"

const initialState = {
  message: null,
  errors: {},
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Updating Purchase..." : "Update Purchase"}
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
  const updatePurchaseWithId = updatePurchase.bind(null, purchase.id)
  const [state, dispatch] = useFormState(updatePurchaseWithId, initialState)

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
    <form action={dispatch}>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="supplier_id">Supplier</Label>
          <Select name="supplier_id" defaultValue={String(purchase.supplier_id)} required>
            <SelectTrigger>
              <SelectValue placeholder="Select a supplier" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={String(supplier.id)}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="product_id">Product</Label>
          <Select name="product_id" defaultValue={String(purchase.purchase_items[0]?.product_id)} required>
            <SelectTrigger>
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={String(product.id)}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input name="quantity" type="number" defaultValue={purchase.purchase_items[0]?.quantity} required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="unit_price">Unit Price</Label>
          <Input name="unit_price" type="number" defaultValue={purchase.purchase_items[0]?.unit_price} required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="purchase_date">Purchase Date</Label>
          <Input name="purchase_date" type="date" defaultValue={purchase.date.split("T")[0]} required />
        </div>

        <SubmitButton />
      </div>
    </form>
  )
}
