"use client"

import { useState } from "react"

import { useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
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
  products: Pick<Product, "id" | "name" | "prix_vente_detail_1" | "prix_vente_detail_2" | "prix_vente_gros">[]
  clients: Pick<Client, "id" | "name">[]
}

export default function SaleForm({ sale, products, clients }: SaleFormProps) {
  const action = sale ? updateSale.bind(null, sale.id) : createSale
  const [state, formAction] = useFormState(action, { message: null, errors: {} })

  const [selectedProduct, setSelectedProduct] = useState(sale?.product_id || "")
  const [quantity, setQuantity] = useState(sale?.quantity || 1)
  const [pricePlan, setPricePlan] = useState(sale?.price_plan || "detail_1")
  const [unitPrice, setUnitPrice] = useState(sale?.unit_price || 0)

  const pricePlanMapping = {
    detail_1: "prix_vente_detail_1" as const,
    detail_2: "prix_vente_detail_2" as const,
    gros: "prix_vente_gros" as const,
  }

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

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="client_id">Client</Label>
          <Select name="client_id" value={sale?.client_id || ""} required>
            <SelectTrigger aria-describedby="client_id-error">
              <SelectValue placeholder="Select a client" />
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
            {renderErrors(state.errors?.client_id)}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sale_date">Sale Date</Label>
          <Input
            id="sale_date"
            name="sale_date"
            type="date"
            defaultValue={sale?.sale_date ? new Date(sale.sale_date).toISOString().split("T")[0] : ""}
            required
            aria-describedby="sale_date-error"
          />
          <div id="sale_date-error" aria-live="polite" aria-atomic="true">
            {renderErrors(state.errors?.sale_date)}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Label>Product Details</Label>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="product_id">Product</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct} required>
              <SelectTrigger aria-describedby="product_id-error">
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div id="product_id-error" aria-live="polite" aria-atomic="true">
              {renderErrors(state.errors?.product_id)}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
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
              {renderErrors(state.errors?.quantity)}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price_plan">Price Plan</Label>
            <Select value={pricePlan} onValueChange={setPricePlan} required>
              <SelectTrigger aria-describedby="price_plan-error">
                <SelectValue placeholder="Select price plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="detail_1">Retail Price 1</SelectItem>
                <SelectItem value="detail_2">Retail Price 2</SelectItem>
                <SelectItem value="gros">Wholesale Price</SelectItem>
              </SelectContent>
            </Select>
            <div id="price_plan-error" aria-live="polite" aria-atomic="true">
              {renderErrors(state.errors?.price_plan)}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit_price">Unit Price</Label>
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
              {renderErrors(state.errors?.unit_price)}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Input
          id="notes"
          name="notes"
          defaultValue={sale?.notes || ""}
          placeholder="Additional notes about this sale"
          aria-describedby="notes-error"
        />
        <div id="notes-error" aria-live="polite" aria-atomic="true">
          {renderErrors(state.errors?.notes)}
        </div>
      </div>

      <div className="flex justify-end">
        <div className="text-xl font-bold">
          <span>Total: </span>
          <span>{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      <SubmitButton isEditing={!!sale} />
    </form>
  )
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Sale" : "Create Sale"}
    </Button>
  )
}
