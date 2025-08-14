"use client"

import type React from "react"
import { useState } from "react"
import { Loader2, Upload, X, ImageIcon } from "lucide-react"
import { createProduct, updateProduct } from "@/app/inventory/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Product } from "@/lib/supabase/types"

export default function ProductForm({ product }: { product?: Product }) {
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image || null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    const fileInput = document.getElementById("image") as HTMLInputElement
    if (fileInput) fileInput.value = ""
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    const formData = new FormData(event.currentTarget as HTMLFormElement)

    // Add image file to form data if selected
    if (imageFile) {
      formData.append("image", imageFile)
    }

    if (product) {
      await updateProduct(product.id, { success: false }, formData)
    } else {
      await createProduct({ success: false }, formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom du Produit</Label>
        <Input id="name" name="name" defaultValue={product?.name ?? ""} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={product?.description ?? ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Image du Produit</Label>
        <div className="flex flex-col space-y-2">
          {imagePreview ? (
            <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
              <img
                src={imagePreview || "/placeholder.svg"}
                alt="Aperçu du produit"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("image")?.click()}
              className="flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Choisir une image</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type de Produit</Label>
        <Input id="type" name="type" defaultValue={product?.type ?? ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit">Unité</Label>
        <Input id="unit" name="unit" defaultValue={product?.unit ?? ""} placeholder="e.g., kg, pièces, litres" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="prix_achat">Prix d'Achat</Label>
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
          <Label htmlFor="prix_vente_detail_1">Prix de Vente Detail 1</Label>
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
          <Label htmlFor="quantity">Quantité en Stock</Label>
          <Input id="quantity" name="quantity" type="number" defaultValue={product?.quantity ?? ""} required />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="prix_vente_detail_2">Prix de Vente Detail 2 (Optionnel)</Label>
          <Input
            id="prix_vente_detail_2"
            name="prix_vente_detail_2"
            type="number"
            step="0.01"
            defaultValue={product?.prix_vente_detail_2 ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prix_vente_gros">Prix de Vente Gros (Optionnel)</Label>
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
        <Label htmlFor="seuil_stock_bas">Seuil de Stock Bas</Label>
        <Input
          id="seuil_stock_bas"
          name="seuil_stock_bas"
          type="number"
          defaultValue={product?.seuil_stock_bas ?? ""}
          placeholder="Alerte lorsque le stock tombe en dessous de ce nombre"
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading
          ? product
            ? "Mise à jour..."
            : "Création..."
          : product
            ? "Mettre à jour le Produit"
            : "Créer un Produit"}
      </Button>
    </form>
  )
}
