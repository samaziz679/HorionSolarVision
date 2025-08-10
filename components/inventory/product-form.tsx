"use client"

import { useFormState, useFormStatus } from "react-dom"
import { createProduct } from "@/app/inventory/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Supplier } from "@/lib/supabase/types"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? "Creating..." : "Create Product"}
    </Button>
  )
}

export default function ProductForm({ suppliers }: { suppliers: Supplier[] }) {
  const initialState = { message: null, errors: {} }
  const [state, dispatch] = useFormState(createProduct, initialState)

  return (
    <form action={dispatch} className="space-y-4 max-w-lg">
      <div>
        <Label htmlFor="name">Product Name</Label>
        <Input id="name" name="name" required />
        {state.errors?.name && <p className="text-sm text-red-500 mt-1">{state.errors.name[0]}</p>}
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" />
      </div>
      <div>
        <Label htmlFor="price">Price</Label>
        <Input id="price" name="price" type="number" step="0.01" required />
        {state.errors?.price && <p className="text-sm text-red-500 mt-1">{state.errors.price[0]}</p>}
      </div>
      <div>
        <Label htmlFor="quantity">Quantity</Label>
        <Input id="quantity" name="quantity" type="number" required />
        {state.errors?.quantity && <p className="text-sm text-red-500 mt-1">{state.errors.quantity[0]}</p>}
      </div>
      <div>
        <Label htmlFor="supplier_id">Supplier</Label>
        <Select name="supplier_id" required>
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
        {state.errors?.supplier_id && <p className="text-sm text-red-500 mt-1">{state.errors.supplier_id[0]}</p>}
      </div>
      <SubmitButton />
    </form>
  )
}
