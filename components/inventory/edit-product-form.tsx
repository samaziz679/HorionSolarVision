"use client"

import { useState } from "react"
import { updateProduct } from "@/app/inventory/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Product } from "@/lib/supabase/types"
import type { State } from "@/app/inventory/actions"

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  return (
    <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
      {isLoading ? "Updating..." : "Update Product"}
    </Button>
  )
}

export default function EditProductForm({ product }: { product: Product }) {
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
        {state.errors?.description && <p className="text-sm text-red-500 mt-1">{state.errors.description[0]}</p>}
      </div>

      <div>
        <Label htmlFor="type">Product Type</Label>
        <Input id="type" name="type" defaultValue={product.type ?? ""} />
        {state.errors?.type && <p className="text-sm text-red-500 mt-1">{state.errors.type[0]}</p>}
      </div>

      <div>
        <Label htmlFor="unit">Unit</Label>
        <Input id="unit" name="unit" defaultValue={product.unit ?? ""} placeholder="e.g., kg, pieces, liters" />
        {state.errors?.unit && <p className="text-sm text-red-500 mt-1">{state.errors.unit[0]}</p>}
      </div>

      <div>
        <Label htmlFor="prix_achat">Purchase Price (Prix d'achat)</Label>
        <Input
          id="prix_achat"
          name="prix_achat"
          type="number"
          step="0.01"
          defaultValue={product.prix_achat ?? ""}
          required
        />
        {state.errors?.prix_achat && <p className="text-sm text-red-500 mt-1">{state.errors.prix_achat[0]}</p>}
      </div>

      <div>
        <Label htmlFor="prix_vente_detail_1">Retail Price 1 (Prix de vente détail 1)</Label>
        <Input
          id="prix_vente_detail_1"
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
        <Label htmlFor="prix_vente_detail_2">Retail Price 2 (Prix de vente détail 2)</Label>
        <Input
          id="prix_vente_detail_2"
          name="prix_vente_detail_2"
          type="number"
          step="0.01"
          defaultValue={product.prix_vente_detail_2 ?? ""}
        />
        {state.errors?.prix_vente_detail_2 && (
          <p className="text-sm text-red-500 mt-1">{state.errors.prix_vente_detail_2[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="prix_vente_gros">Wholesale Price (Prix de vente gros)</Label>
        <Input
          id="prix_vente_gros"
          name="prix_vente_gros"
          type="number"
          step="0.01"
          defaultValue={product.prix_vente_gros ?? ""}
        />
        {state.errors?.prix_vente_gros && (
          <p className="text-sm text-red-500 mt-1">{state.errors.prix_vente_gros[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="quantity">Stock Quantity</Label>
        <Input id="quantity" name="quantity" type="number" defaultValue={product.quantity ?? ""} required />
        {state.errors?.quantity && <p className="text-sm text-red-500 mt-1">{state.errors.quantity[0]}</p>}
      </div>

      <div>
        <Label htmlFor="seuil_stock_bas">Low Stock Threshold</Label>
        <Input
          id="seuil_stock_bas"
          name="seuil_stock_bas"
          type="number"
          defaultValue={product.seuil_stock_bas ?? ""}
          placeholder="Alert when stock falls below this number"
        />
        {state.errors?.seuil_stock_bas && (
          <p className="text-sm text-red-500 mt-1">{state.errors.seuil_stock_bas[0]}</p>
        )}
      </div>

      {state.message && (
        <div className={`p-3 rounded ${state.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {state.message}
        </div>
      )}

      <SubmitButton isLoading={isLoading} />
    </form>
  )
}
