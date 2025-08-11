"use client"

import { useState } from "react"
import { updateProduct } from "@/app/inventory/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Product, Supplier } from "@/lib/supabase/types"
import type { State } from "@/app/inventory/actions"

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  return (
    <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
      {isLoading ? "Updating..." : "Update Product"}
    </Button>
  )
}

export default function EditProductForm({ product, suppliers }: { product: Product; suppliers: Supplier[] }) {
  const [state, setState] = useState<State>({ message: null, errors: {} })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setState({ message: null, errors: {} })

    try {
      const updateProductWithId = updateProduct.bind(null, product.id)
      const result = await updateProductWithId(state, formData)
      setState(result)
    } catch (error) {
      setState({ message: "An error occurred", errors: {} })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit(new FormData(e.currentTarget))
      }}
      className="space-y-4 max-w-lg"
    >
      <div>
        <Label htmlFor="name">Product Name</Label>
        <Input id="name" name="name" defaultValue={product.name ?? ""} required />
        {state.errors?.name && <p className="text-sm text-red-500 mt-1">{state.errors.name[0]}</p>}
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={product.description ?? ""} />
      </div>
      <div>
        <Label htmlFor="price">Price</Label>
        <Input id="price" name="price" type="number" step="0.01" defaultValue={product.price ?? ""} required />
        {state.errors?.price && <p className="text-sm text-red-500 mt-1">{state.errors.price[0]}</p>}
      </div>
      <div>
        <Label htmlFor="stock_quantity">Stock Quantity</Label>
        <Input
          id="stock_quantity"
          name="stock_quantity"
          type="number"
          defaultValue={product.stock_quantity ?? ""}
          required
        />
        {state.errors?.stock_quantity && <p className="text-sm text-red-500 mt-1">{state.errors.stock_quantity[0]}</p>}
      </div>
      <div>
        <Label htmlFor="supplier_id">Supplier</Label>
        <Select name="supplier_id" defaultValue={product.supplier_id ? String(product.supplier_id) : ""}>
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
      <SubmitButton isLoading={isLoading} />
    </form>
  )
}
