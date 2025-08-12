"use client"

import type React from "react"
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    const formData = new FormData(event.currentTarget as HTMLFormElement)

    if (product) {
      await updateProduct(product.id, { success: false }, formData)
    } else {
      await createProduct({ success: false }, formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input id="name" name="name" defaultValue={product?.name ?? ""} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={product?.description ?? ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Product Type</Label>
        <Input id="type" name="type" defaultValue={product?.type ?? ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit">Unit</Label>
        <Input id="unit" name="unit" defaultValue={product?.unit ?? ""} placeholder="e.g., kg, pieces, liters" />
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
        />
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
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity">Stock Quantity</Label>
          <Input id="quantity" name="quantity" type="number" defaultValue={product?.quantity ?? ""} required />
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
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prix_vente_gros">Wholesale Price (Optional)</Label>
          <Input
            id="prix_vente_gros"
            name="prix_vente_gros"
            type="number"
            step="0.01"
            defaultValue={product?.prix_vente_gros ?? ""}
          />
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
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? (product ? "Updating..." : "Creating...") : product ? "Update Product" : "Create Product"}
      </Button>
    </form>
  )
}
