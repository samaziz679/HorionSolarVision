"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { createPurchase, updatePurchase, type State } from "@/app/purchases/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  const [state, setState] = useState<State>({ message: null, errors: {} })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setState({ message: null, errors: {} })

    try {
      const action = purchase ? updatePurchase.bind(null, purchase.id) : createPurchase
      const result = await action(state, formData)
      setState(result)
    } catch (error) {
      setState({ message: "An error occurred", errors: {} })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (state.message) {
      if (state.success === false) {
        toast.error(state.message)
      } else if (state.success === true) {
        toast.success(state.message)
      }
    }
  }, [state])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit(new FormData(e.currentTarget))
      }}
      className="space-y-4"
    >
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
            defaultValue={purchase?.quantity ?? ""}
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
          <Label htmlFor="total_cost">Total Cost</Label>
          <Input
            id="total_cost"
            name="total_cost"
            type="number"
            step="0.01"
            defaultValue={purchase?.total_cost ?? ""}
            aria-describedby="total_cost-error"
          />
          <div id="total_cost-error" aria-live="polite" aria-atomic="true">
            {state.errors?.total_cost &&
              state.errors.total_cost.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Purchase Date</Label>
        <Input
          id="date"
          name="date"
          type="date"
          defaultValue={purchase?.date ? new Date(purchase.date).toISOString().split("T")[0] : ""}
          aria-describedby="date-error"
        />
        <div id="date-error" aria-live="polite" aria-atomic="true">
          {state.errors?.date &&
            state.errors.date.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>
      <SubmitButton isEditing={!!purchase} isLoading={isLoading} />
    </form>
  )
}

function SubmitButton({ isEditing, isLoading }: { isEditing: boolean; isLoading: boolean }) {
  return (
    <Button type="submit" disabled={isLoading} className="w-full">
      {isLoading ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Purchase" : "Create Purchase"}
    </Button>
  )
}
