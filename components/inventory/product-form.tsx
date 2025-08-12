"use client"

import type React from "react"
import type { HTMLFormElement } from "react"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { createProduct, updateProduct } from "@/app/inventory/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Product } from "@/lib/supabase/types"

export default function ProductForm({ product }: { product?: Product }) {
  const [isLoading, setIsLoading] = useState(false)
  const [state, setState] = useState({ errors: {} })

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    const formData = new FormData(event.currentTarget)

    if (product) {
      await updateProduct(product.id, { success: false }, formData)
    } else {
      await createProduct({ success: false }, formData)
    }
    setIsLoading(false)
  }

  const renderErrors = (errors: string[] | undefined) => {
    if (!errors || !Array.isArray(errors)) return null
    return errors.map((error: string) => (
      <p className="mt-2 text-sm text-red-500" key={error}>
        {error}
      </p>
    ))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input id="name" name="name" defaultValue={product?.name ?? ""} required aria-describedby="name-error" />
        <div id="name-error" aria-live="polite" aria-atomic="true">
          {renderErrors(state.errors?.name)}
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
          {renderErrors(state.errors?.description)}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Product Type</Label>
        <Input id="type" name="type" defaultValue={product?.type ?? ""} aria-describedby="type-error" />
        <div id="type-error" aria-live="polite" aria-atomic="true">
          {renderErrors(state.errors?.type)}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit">Unit</Label>
        <Input
          id="unit"
          name="unit"
          defaultValue={product?.unit ?? ""}
          placeholder="e.g., kg, pieces, liters"
          aria-describedby="unit-error"
        />
        <div id="unit-error" aria-live="polite" aria-atomic="true">
          {renderErrors(state.errors?.unit)}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="prix_achat">Purchase Price (Prix d'achat)</Label>
        <Input
          id="prix_achat"
          name="prix_achat"
          type="number"
          step="0.01"
          defaultValue={product?.prix_achat ?? ""}
          required
          aria-describedby="prix_achat-error"
        />
        <div id="prix_achat-error" aria-live="polite" aria-atomic="true">
          {renderErrors(state.errors?.prix_achat)}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="prix_vente_detail_1">Retail Price 1</Label>
          <Input
            id="prix_vente_detail_1"
            name="prix_vente_detail_1"
            type="number"
            step="0.01"
            defaultValue={product?.prix_vente_detail_1 ?? ""}
            required
            aria-describedby="prix_vente_detail_1-error"
          />
          <div id="prix_vente_detail_1-error" aria-live="polite" aria-atomic="true">
            {renderErrors(state.errors?.prix_vente_detail_1)}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity">Stock Quantity</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            defaultValue={product?.quantity ?? ""}
            required
            aria-describedby="quantity-error"
          />
          <div id="quantity-error" aria-live="polite" aria-atomic="true">
            {renderErrors(state.errors?.quantity)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="prix_vente_detail_2">Retail Price 2 (Optional)</Label>
          <Input
            id="prix_vente_detail_2"
            name="prix_vente_detail_2"
            type="number"
            step="0.01"
            defaultValue={product?.prix_vente_detail_2 ?? ""}
            aria-describedby="prix_vente_detail_2-error"
          />
          <div id="prix_vente_detail_2-error" aria-live="polite" aria-atomic="true">
            {renderErrors(state.errors?.prix_vente_detail_2)}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="prix_vente_gros">Wholesale Price (Optional)</Label>
          <Input
            id="prix_vente_gros"
            name="prix_vente_gros"
            type="number"
            step="0.01"
            defaultValue={product?.prix_vente_gros ?? ""}
            aria-describedby="prix_vente_gros-error"
          />
          <div id="prix_vente_gros-error" aria-live="polite" aria-atomic="true">
            {renderErrors(state.errors?.prix_vente_gros)}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="seuil_stock_bas">Low Stock Threshold</Label>
        <Input
          id="seuil_stock_bas"
          name="seuil_stock_bas"
          type="number"
          defaultValue={product?.seuil_stock_bas ?? ""}
          placeholder="Alert when stock falls below this number"
          aria-describedby="seuil_stock_bas-error"
        />
        <div id="seuil_stock_bas-error" aria-live="polite" aria-atomic="true">
          {renderErrors(state.errors?.seuil_stock_bas)}
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? (product ? "Updating..." : "Creating...") : product ? "Update Product" : "Create Product"}
      </Button>
    </form>
  )
}
