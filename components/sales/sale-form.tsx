"use client"

import type React from "react"

import { useState } from "react"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { createSale, updateSale } from "@/app/sales/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Sale, Product, Client } from "@/lib/supabase/types"
import { formatCurrency } from "@/lib/currency"

type SaleFormProps = {
  sale?: Sale
  products: Pick<Product, "id" | "name" | "prix_vente_detail_1" | "prix_vente_detail_2" | "prix_vente_gros" | "image">[]
  clients: Pick<Client, "id" | "name">[]
}

export default function SaleForm({ sale, products, clients }: SaleFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(sale?.product_id || "")
  const [selectedClient, setSelectedClient] = useState(sale?.client_id || "")
  const [quantity, setQuantity] = useState(sale?.quantity || 1)
  const [pricePlan, setPricePlan] = useState(sale?.price_plan || "detail_1")
  const [unitPrice, setUnitPrice] = useState(sale?.unit_price || 0)

  useEffect(() => {
    if (sale) {
      setSelectedProduct(sale.product_id || "")
      setSelectedClient(sale.client_id || "")
    }
  }, [sale])

  const pricePlanMapping = {
    detail_1: "prix_vente_detail_1" as const,
    detail_2: "prix_vente_detail_2" as const,
    gros: "prix_vente_gros" as const,
  }

  const selectedProductData = products.find((p) => p.id === selectedProduct)

  useEffect(() => {
    const product = products.find((p) => p.id === selectedProduct)
    if (product) {
      const priceProperty = pricePlanMapping[pricePlan as keyof typeof pricePlanMapping]
      setUnitPrice(Number(product[priceProperty]))
    }
  }, [selectedProduct, pricePlan, products])

  const totalAmount = quantity * unitPrice

  const renderErrors = (errors: string[] | undefined) => {
    if (!errors || !Array.isArray(errors)) return null
    return errors.map((error: string) => (
      <p className="mt-2 text-sm text-red-500" key={error}>
        {error}
      </p>
    ))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)

    formData.set("product_id", selectedProduct)
    formData.set("client_id", selectedClient)
    formData.set("quantity", quantity.toString())
    formData.set("price_plan", pricePlan)
    formData.set("unit_price", unitPrice.toString())

    if (sale) {
      await updateSale(sale.id, { success: false }, formData)
    } else {
      await createSale({ success: false }, formData)
    }
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="client_id">Client</Label>
          <Select value={selectedClient} onValueChange={setSelectedClient} required>
            <SelectTrigger aria-describedby="client_id-error">
              <SelectValue placeholder="Sélectionner un client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div id="client_id-error" aria-live="polite" aria-atomic="true">
            {renderErrors([])}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sale_date">Date de Vente</Label>
          <Input
            id="sale_date"
            name="sale_date"
            type="date"
            defaultValue={sale?.sale_date ? new Date(sale.sale_date).toISOString().split("T")[0] : ""}
            required
            aria-describedby="sale_date-error"
          />
          <div id="sale_date-error" aria-live="polite" aria-atomic="true">
            {renderErrors([])}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Label>Détails du Produit</Label>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="product_id">Produit</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct} required>
              <SelectTrigger aria-describedby="product_id-error">
                <SelectValue placeholder="Sélectionner un produit" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div id="product_id-error" aria-live="polite" aria-atomic="true">
              {renderErrors([])}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantité</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value) || 1)}
              required
              aria-describedby="quantity-error"
            />
            <div id="quantity-error" aria-live="polite" aria-atomic="true">
              {renderErrors([])}
            </div>
          </div>
        </div>

        {selectedProductData && (
          <div className="space-y-2">
            {selectedProductData.image ? (
              <div className="flex justify-center">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="text-center">
                    <img
                      src={selectedProductData.image || "/placeholder.svg"}
                      alt={selectedProductData.name}
                      className="mx-auto h-24 w-24 rounded-lg object-cover shadow-sm"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                    <p className="mt-2 text-xs font-medium text-gray-600">{selectedProductData.name}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-xs text-gray-400 py-2">Aucune image disponible pour ce produit</div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price_plan">Plan de Prix</Label>
            <Select value={pricePlan} onValueChange={setPricePlan} required>
              <SelectTrigger aria-describedby="price_plan-error">
                <SelectValue placeholder="Sélectionner le plan de prix" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="detail_1">Prix Détail 1</SelectItem>
                <SelectItem value="detail_2">Prix Détail 2</SelectItem>
                <SelectItem value="gros">Prix de Gros</SelectItem>
              </SelectContent>
            </Select>
            <div id="price_plan-error" aria-live="polite" aria-atomic="true">
              {renderErrors([])}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit_price">Prix Unitaire</Label>
            <Input
              id="unit_price"
              type="number"
              step="0.01"
              value={unitPrice}
              onChange={(e) => setUnitPrice(Number(e.target.value) || 0)}
              required
              aria-describedby="unit_price-error"
            />
            <div id="unit_price-error" aria-live="polite" aria-atomic="true">
              {renderErrors([])}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optionnelles)</Label>
        <Input
          id="notes"
          name="notes"
          defaultValue={sale?.notes || ""}
          placeholder="Notes supplémentaires sur cette vente"
          aria-describedby="notes-error"
        />
        <div id="notes-error" aria-live="polite" aria-atomic="true">
          {renderErrors([])}
        </div>
      </div>

      <div className="flex justify-end">
        <div className="text-xl font-bold">
          <span>Total: </span>
          <span>{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? (sale ? "Mise à jour..." : "Création...") : sale ? "Mettre à jour la vente" : "Créer une vente"}
      </Button>
    </form>
  )
}
