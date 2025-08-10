"use client"

import { useFormState, useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateSale } from "@/app/sales/actions"
import { useEffect } from "react"
import { toast } from "sonner"
import type { Product } from "@/lib/supabase/types"
import type { Client } from "@/lib/supabase/types"
import type { SaleWithItems } from "@/lib/supabase/types"

type EditSaleFormProps = {
  sale: SaleWithItems
  products: Product[]
  clients: Client[]
}

export function EditSaleForm({ sale, products, clients }: EditSaleFormProps) {
  const initialState = { message: null, errors: {} }
  const updateSaleWithId = updateSale.bind(null, sale.id)
  const [state, dispatch] = useFormState(updateSaleWithId, initialState)

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
          <Label htmlFor="client_id">Client</Label>
          <Select name="client_id" defaultValue={String(sale.client_id)} required>
            <SelectTrigger>
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="product_id">Product</Label>
          <Select name="product_id" defaultValue={String(sale.sale_items[0]?.product_id)} required>
            <SelectTrigger>
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input name="quantity" type="number" defaultValue={sale.sale_items[0]?.quantity} required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="unit_price">Unit Price</Label>
          <Input name="unit_price" type="number" defaultValue={sale.sale_items[0]?.unit_price} required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="sale_date">Sale Date</Label>
          <Input name="sale_date" type="date" defaultValue={sale.date.split("T")[0]} required />
        </div>

        <SubmitButton />
      </div>
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Updating Sale..." : "Update Sale"}
    </Button>
  )
}
