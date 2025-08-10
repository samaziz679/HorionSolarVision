"use client"

import { useFormState, useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createSale } from "@/app/sales/actions"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import type { ProductOption } from "@/lib/data/products"
import type { ClientOption } from "@/lib/data/clients"

type SaleFormProps = {
  products: ProductOption[]
  clients: ClientOption[]
}

export function SaleForm({ products, clients }: SaleFormProps) {
  const initialState = { message: null, errors: {} }
  const [state, dispatch] = useFormState(createSale, initialState)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [priceType, setPriceType] = useState<"detail" | "gros">("detail")
  const [unitPrice, setUnitPrice] = useState<number>(0)

  useEffect(() => {
    if (selectedProductId) {
      const product = products.find((p) => p.id === selectedProductId)
      if (product) {
        const price = priceType === "detail" ? product.prix_vente_detail_1 : product.prix_vente_gros_1
        setUnitPrice(price ?? 0)
      }
    }
  }, [selectedProductId, priceType, products])

  useEffect(() => {
    if (state.message) {
      if (state.errors) {
        toast.error(state.message)
      } else {
        toast.success(state.message)
      }
    }
  }, [state])

  return (
    <form action={dispatch}>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="client_id">Client</Label>
          <Select name="client_id" required>
            <SelectTrigger>
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
        </div>

        <div className="grid gap-2">
          <Label htmlFor="product_id">Product</Label>
          <Select name="product_id" onValueChange={setSelectedProductId} required>
            <SelectTrigger>
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
        </div>

        <div className="grid gap-2">
          <Label>Price Type</Label>
          <Select onValueChange={(value: "detail" | "gros") => setPriceType(value)} defaultValue="detail">
            <SelectTrigger>
              <SelectValue placeholder="Select price type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="detail">Prix Détail</SelectItem>
              <SelectItem value="gros">Prix Gros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="unit_price">Unit Price</Label>
          <Input
            name="unit_price"
            type="number"
            value={unitPrice}
            onChange={(e) => setUnitPrice(Number(e.target.value))}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input name="quantity" type="number" placeholder="0" required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="sale_date">Sale Date</Label>
          <Input name="sale_date" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
        </div>

        <SubmitButton />
      </div>
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Creating Sale..." : "Create Sale"}
    </Button>
  )
}
