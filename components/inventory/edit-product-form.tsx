"use client"

import type React from "react"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { updateProduct } from "@/app/inventory/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Product } from "@/lib/supabase/types"

export default function EditProductForm({ product }: { product: Product }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    const formData = new FormData(event.currentTarget)

    await updateProduct(product.id, { success: false }, formData)
    // Note: redirect() in server actions will handle navigation
    setIsLoading(false)
  }

  const renderErrors = (errors: string[] | undefined) => {
    if (!errors || !Array.isArray(errors)) return null
    return errors.map((error: string) => (
      <p className="text-sm text-red-500 mt-1" key={error}>
        {error}
      </p>
    ))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <Label htmlFor="name">Product Name</Label>
        <Input id="name" name="name" defaultValue={product.name ?? ""} required />
        {renderErrors([])} {/* Placeholder for errors */}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={product.description ?? ""} />
        {renderErrors([])} {/* Placeholder for errors */}
      </div>

      <div>
        <Label htmlFor="type">Product Type</Label>
        <Input id="type" name="type" defaultValue={product.type ?? ""} />
        {renderErrors([])} {/* Placeholder for errors */}
      </div>

      <div>
        <Label htmlFor="unit">Unit</Label>
        <Input id="unit" name="unit" defaultValue={product.unit ?? ""} placeholder="e.g., kg, pieces, liters" />
        {renderErrors([])} {/* Placeholder for errors */}
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
        {renderErrors([])} {/* Placeholder for errors */}
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
        {renderErrors([])} {/* Placeholder for errors */}
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
        {renderErrors([])} {/* Placeholder for errors */}
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
        {renderErrors([])} {/* Placeholder for errors */}
      </div>

      <div>
        <Label htmlFor="quantity">Stock Quantity</Label>
        <Input id="quantity" name="quantity" type="number" defaultValue={product.quantity ?? ""} required />
        {renderErrors([])} {/* Placeholder for errors */}
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
        {renderErrors([])} {/* Placeholder for errors */}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? "Updating..." : "Update Product"}
      </Button>
    </form>
  )
}
