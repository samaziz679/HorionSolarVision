"use client"

import { useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { toast } from "sonner"
import { createProduct, updateProduct, type State } from "@/app/inventory/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Product, Supplier } from "@/lib/supabase/types"

export default function ProductForm({
  product,
  suppliers,
}: {
  product?: Product
  suppliers: Pick<Supplier, "id" | "name">[]
}) {
  const initialState: State = { message: null, errors: {} }
  const action = product ? updateProduct.bind(null, product.id) : createProduct
  const [state, dispatch] = useFormState(action, initialState)

  useEffect(() => {
    if (state.message) {
      if (state.success === false) {
        toast.error(state.message)
      } else {
        toast.success(state.message)
      }
    }
  }, [state])

  return (
    <form action={dispatch} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input id="name" name="name" defaultValue={product?.name} aria-describedby="name-error" />
        <div id="name-error" aria-live="polite" aria-atomic="true">
          {state.errors?.name &&
            state.errors.name.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={product?.description ?? ""}
          aria-describedby="description-error"
        />
        <div id="description-error" aria-live="polite" aria-atomic="true">
          {state.errors?.description &&
            state.errors.description.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            defaultValue={product?.price}
            aria-describedby="price-error"
          />
          <div id="price-error" aria-live="polite" aria-atomic="true">
            {state.errors?.price &&
              state.errors.price.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock_quantity">Stock Quantity</Label>
          <Input
            id="stock_quantity"
            name="stock_quantity"
            type="number"
            defaultValue={product?.stock_quantity}
            aria-describedby="stock_quantity-error"
          />
          <div id="stock_quantity-error" aria-live="polite" aria-atomic="true">
            {state.errors?.stock_quantity &&
              state.errors.stock_quantity.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="supplier_id">Supplier</Label>
        <Select name="supplier_id" defaultValue={product?.supplier_id?.toString()}>
          <SelectTrigger aria-describedby="supplier-error">
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
        <div id="supplier-error" aria-live="polite" aria-atomic="true">
          {state.errors?.supplier_id &&
            state.errors.supplier_id.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>
      <SubmitButton isEditing={!!product} />
    </form>
  )
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Product" : "Create Product"}
    </Button>
  )
}
