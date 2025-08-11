"use client"

import { useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { toast } from "sonner"
import { createPurchase, updatePurchase, type State } from "@/app/purchases/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Purchase, Product, Supplier } from "@/lib/supabase/types"

export function PurchaseForm({
  purchase,
  products,
  suppliers,
}: {
  purchase?: Purchase
  products: Product[]
  suppliers: Supplier[]
}) {
  const initialState: State = { message: null, errors: {} }
  const action = purchase ? updatePurchase.bind(null, purchase.id) : createPurchase
  const [state, dispatch] = useFormState(action, initialState)

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
    <form action={dispatch} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="supplier_id">Supplier</Label>
        <Select name="supplier_id" defaultValue={purchase?.supplier_id?.toString()}>
          <SelectTrigger aria-describedby="supplier_id-error">
            <SelectValue placeholder="Select a supplier" />
          </SelectTrigger>
          <SelectContent>
            {suppliers.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id.toString()}>
                {supplier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div id="supplier_id-error" aria-live="polite" aria-atomic="true">
          {state.errors?.supplier_id &&
            state.errors.supplier_id.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="product_id">Product</Label>
        <Select name="product_id" defaultValue={purchase?.product_id?.toString()}>
          <SelectTrigger aria-describedby="product_id-error">
            <SelectValue placeholder="Select a product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id.toString()}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div id="product_id-error" aria-live="polite" aria-atomic="true">
          {state.errors?.product_id &&
            state.errors.product_id.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            defaultValue={purchase?.quantity}
            aria-describedby="quantity-error"
          />
          <div id="quantity-error" aria-live="polite" aria-atomic="true">
            {state.errors?.quantity &&
              state.errors.quantity.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="total_price">Total Price</Label>
          <Input
            id="total_price"
            name="total_price"
            type="number"
            step="0.01"
            defaultValue={purchase?.total_price}
            aria-describedby="total_price-error"
          />
          <div id="total_price-error" aria-live="polite" aria-atomic="true">
            {state.errors?.total_price &&
              state.errors.total_price.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="purchase_date">Purchase Date</Label>
        <Input
          id="purchase_date"
          name="purchase_date"
          type="date"
          defaultValue={purchase?.purchase_date ? new Date(purchase.purchase_date).toISOString().split("T")[0] : ""}
          aria-describedby="purchase_date-error"
        />
        <div id="purchase_date-error" aria-live="polite" aria-atomic="true">
          {state.errors?.purchase_date &&
            state.errors.purchase_date.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>
      <SubmitButton isEditing={!!purchase} />
    </form>
  )
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Purchase" : "Create Purchase"}
    </Button>
  )
}
