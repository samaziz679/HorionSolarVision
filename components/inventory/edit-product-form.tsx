"use client"

import { useFormState, useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"
import { updateProduct } from "@/app/inventory/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Product } from "@/lib/supabase/types"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? "Updating..." : "Update Product"}
    </Button>
  )
}

export default function EditProductForm({ product }: { product: Product }) {
  const updateProductWithId = updateProduct.bind(null, product.id)
  const [state] = useFormState(updateProductWithId, { message: null, errors: {} })

  const renderErrors = (errors: string[] | undefined) => {
    if (!errors || !Array.isArray(errors)) return null
    return errors.map((error: string) => (
      <p className="text-sm text-red-500 mt-1" key={error}>
        {error}
      </p>
    ))
  }

  return (
    <form action={updateProductWithId} className="space-y-4 max-w-lg">
      <div>
        <Label htmlFor="name">Product Name</Label>
        <Input id="name" name="name" defaultValue={product.name ?? ""} required />
        {renderErrors(state.errors?.name)}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={product.description ?? ""} />
        {renderErrors(state.errors?.description)}
      </div>

      <div>
        <Label htmlFor="type">Product Type</Label>
        <Input id="type" name="type" defaultValue={product.type ?? ""} />
        {renderErrors(state.errors?.type)}
      </div>

      <div>
        <Label htmlFor="unit">Unit</Label>
        <Input id="unit" name="unit" defaultValue={product.unit ?? ""} placeholder="e.g., kg, pieces, liters" />
        {renderErrors(state.errors?.unit)}
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
        {renderErrors(state.errors?.prix_achat)}
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
        {renderErrors(state.errors?.prix_vente_detail_1)}
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
        {renderErrors(state.errors?.prix_vente_detail_2)}
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
        {renderErrors(state.errors?.prix_vente_gros)}
      </div>

      <div>
        <Label htmlFor="quantity">Stock Quantity</Label>
        <Input id="quantity" name="quantity" type="number" defaultValue={product.quantity ?? ""} required />
        {renderErrors(state.errors?.quantity)}
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
        {renderErrors(state.errors?.seuil_stock_bas)}
      </div>

      {state.message && (
        <div className={`p-3 rounded ${state.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {state.message}
        </div>
      )}

      <SubmitButton />
    </form>
  )
}
