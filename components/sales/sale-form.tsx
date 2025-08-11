"use client"

import { useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { toast } from "sonner"
import { createSale, updateSale, type State } from "@/app/sales/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Sale, Product, Client } from "@/lib/supabase/types"

export function SaleForm({ sale, products, clients }: { sale?: Sale; products: Product[]; clients: Client[] }) {
  const initialState: State = { message: null, errors: {} }
  const action = sale ? updateSale.bind(null, sale.id) : createSale
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
        <Label htmlFor="client_id">Client</Label>
        <Select name="client_id" defaultValue={sale?.client_id?.toString()}>
          <SelectTrigger aria-describedby="client_id-error">
            <SelectValue placeholder="Select a client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id.toString()}>
                {client.first_name} {client.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div id="client_id-error" aria-live="polite" aria-atomic="true">
          {state.errors?.client_id &&
            state.errors.client_id.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="product_id">Product</Label>
        <Select name="product_id" defaultValue={sale?.product_id?.toString()}>
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
            defaultValue={sale?.quantity}
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
            defaultValue={sale?.total_price}
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
        <Label htmlFor="sale_date">Sale Date</Label>
        <Input
          id="sale_date"
          name="sale_date"
          type="date"
          defaultValue={sale?.sale_date ? new Date(sale.sale_date).toISOString().split("T")[0] : ""}
          aria-describedby="sale_date-error"
        />
        <div id="sale_date-error" aria-live="polite" aria-atomic="true">
          {state.errors?.sale_date &&
            state.errors.sale_date.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>
      <SubmitButton isEditing={!!sale} />
    </form>
  )
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Sale" : "Create Sale"}
    </Button>
  )
}
