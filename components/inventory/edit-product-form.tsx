"use client"

import { useState } from "react"
import { updateProduct } from "@/app/inventory/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
        <Input
          id="price"
          name="prix_vente_detail_1"
          type="number"
          step="0.01"
          defaultValue={product.prix_vente_detail_1 ?? ""}
          required
        />
        {state.errors?.prix_vente_detail_1 && (
          <p className="text-sm text-red-500 mt-1">{state.errors.prix_vente_detail_1[0]}</p>
        )}
      </div>
      <div>
        <Label htmlFor="stock_quantity">Stock Quantity</Label>
        <Input id="stock_quantity" name="quantity" type="number" defaultValue={product.quantity ?? ""} required />
        {state.errors?.quantity && <p className="text-sm text-red-500 mt-1">{state.errors.quantity[0]}</p>}
      </div>
      <SubmitButton isLoading={isLoading} />
    </form>
  )
}
