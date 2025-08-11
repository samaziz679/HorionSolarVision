"use client"

import { useState, useEffect } from "react"
import { createSale, updateSale, type State } from "@/app/sales/actions"
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
  const [state, setState] = useState<State>({ message: null, errors: {} })
  const [isLoading, setIsLoading] = useState(false)

  const [selectedProduct, setSelectedProduct] = useState(sale?.product_id || "")
  const [quantity, setQuantity] = useState(sale?.quantity || 1)
  const [pricePlan, setPricePlan] = useState(sale?.price_plan || "detail_1")
  const [unitPrice, setUnitPrice] = useState(sale?.unit_price || 0)

  useEffect(() => {
    const product = products.find((p) => p.id === selectedProduct)
    if (product) {
      setUnitPrice(Number(product[`prix_vente_${pricePlan}`]))
    }
  }, [selectedProduct, pricePlan, products])

  const totalAmount = quantity * unitPrice

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setState({ message: null, errors: {} })

    formData.set("product_id", selectedProduct)
    formData.set("quantity", quantity.toString())
    formData.set("price_plan", pricePlan)
    formData.set("unit_price", unitPrice.toString())

    try {
      const action = sale ? updateSale.bind(null, sale.id) : createSale
      const result = await action(state, formData)
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
      className="space-y-6"
    >
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
            {state.errors?.client_id &&
              state.errors.client_id.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
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
            {state.errors?.sale_date &&
              state.errors.sale_date.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
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
              {state.errors?.product_id &&
                state.errors.product_id.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
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
              {state.errors?.quantity &&
                state.errors.quantity.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
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
              {state.errors?.price_plan &&
                state.errors.price_plan.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
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
              {state.errors?.unit_price &&
                state.errors.unit_price.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
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
          {state.errors?.notes &&
            state.errors.notes.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>

      <div className="flex justify-end">
        <div className="text-xl font-bold">
          <span>Total: </span>
          <span>{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (sale ? "Updating Sale..." : "Creating Sale...") : sale ? "Update Sale" : "Create Sale"}
      </Button>
    </form>
  )
}
