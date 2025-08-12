"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
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

  const renderErrors = (errors: string[] | undefined) => {
    if (!errors || !Array.isArray(errors)) return null
    return errors.map((error: string) => (
      <p className="mt-2 text-sm text-red-500" key={error}>
        {error}
      </p>
    ))
  }

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
        <Select name="supplier_id" defaultValue={purchase?.supplier_id?.toString()} required>
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
          {renderErrors(state.errors?.supplier_id)}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="product_id">Product</Label>
        <Select name="product_id" defaultValue={purchase?.product_id?.toString()} required>
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
          {renderErrors(state.errors?.product_id)}
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
            required
            aria-describedby="quantity-error"
          />
          <div id="quantity-error" aria-live="polite" aria-atomic="true">
            {renderErrors(state.errors?.quantity)}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="total">Total Cost</Label>
          <Input
            id="total"
            name="total"
            type="number"
            step="0.01"
            defaultValue={purchase?.total ?? ""}
            required
            aria-describedby="total-error"
          />
          <div id="total-error" aria-live="polite" aria-atomic="true">
            {renderErrors(state.errors?.total)}
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
          required
          aria-describedby="purchase_date-error"
        />
        <div id="purchase_date-error" aria-live="polite" aria-atomic="true">
          {renderErrors(state.errors?.purchase_date)}
        </div>
      </div>
      <SubmitButton isEditing={!!purchase} isLoading={isLoading} />
    </form>
  )
}

function SubmitButton({ isEditing, isLoading }: { isEditing: boolean; isLoading: boolean }) {
  return (
    <Button type="submit" disabled={isLoading} className="w-full">
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Purchase" : "Create Purchase"}
    </Button>
  )
}
