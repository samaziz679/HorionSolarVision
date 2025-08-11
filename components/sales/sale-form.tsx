"use client"

import { useState, useEffect, useMemo } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { toast } from "sonner"
import { createSale, updateSale, type State } from "@/app/sales/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2 } from "lucide-react"
import type { Sale, Product, Client, SaleItem } from "@/lib/supabase/types"
import { formatCurrency } from "@/lib/currency"

type SaleFormProps = {
  sale?: Sale & { sale_items: SaleItem[] }
  products: Pick<Product, "id" | "name" | "price">[]
  clients: Pick<Client, "id" | "first_name" | "last_name">[]
}

type SaleItemForm = {
  id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total: number
}

export default function SaleForm({ sale, products, clients }: SaleFormProps) {
  const initialState: State = { message: null, errors: {} }
  const action = sale ? updateSale.bind(null, sale.id) : createSale
  const [state, dispatch] = useFormState(action, initialState)

  const [items, setItems] = useState<SaleItemForm[]>(
    sale?.sale_items.map((item) => {
      const product = products.find((p) => p.id === item.product_id)
      return {
        id: `item-${item.id}`,
        product_id: item.product_id.toString(),
        product_name: product?.name ?? "Unknown",
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        total: item.quantity * Number(item.unit_price),
      }
    }) || [],
  )

  const [selectedProduct, setSelectedProduct] = useState<string>("")

  const totalAmount = useMemo(() => items.reduce((sum, item) => sum + item.total, 0), [items])

  useEffect(() => {
    if (state.message) {
      if (state.errors && Object.keys(state.errors).length > 0) {
        toast.error(state.message)
      } else {
        toast.success(state.message)
      }
    }
  }, [state])

  const handleAddItem = () => {
    const product = products.find((p) => p.id.toString() === selectedProduct)
    if (!product || items.some((item) => item.product_id === selectedProduct)) {
      toast.warning("Product is already in the sale or not selected.")
      return
    }
    setItems([
      ...items,
      {
        id: `new-${Date.now()}`,
        product_id: product.id.toString(),
        product_name: product.name,
        quantity: 1,
        unit_price: Number(product.price),
        total: Number(product.price),
      },
    ])
    setSelectedProduct("")
  }

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const handleItemChange = (id: string, field: "quantity" | "unit_price", value: number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const newItem = { ...item, [field]: value }
          newItem.total = newItem.quantity * newItem.unit_price
          return newItem
        }
        return item
      }),
    )
  }

  return (
    <form action={dispatch} className="space-y-6">
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(items.map(({ id, product_name, total, ...rest }) => rest))}
      />
      <input type="hidden" name="total_amount" value={totalAmount} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="client_id">Client</Label>
          <Select name="client_id" defaultValue={sale?.client_id?.toString()}>
            <SelectTrigger aria-describedby="client_id-error">
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id.toString()}>
                  {client.first_name} {client.last_name}
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
            defaultValue={sale?.date ? new Date(sale.date).toISOString().split("T")[0] : ""}
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
        <Label>Sale Items</Label>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(item.id, "unit_price", Number.parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger>
              <SelectValue placeholder="Select a product to add" />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id.toString()}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" onClick={handleAddItem}>
            Add Item
          </Button>
        </div>
        {state.errors?.items &&
          state.errors.items.map((error: string) => (
            <p className="mt-2 text-sm text-red-500" key={error}>
              {error}
            </p>
          ))}
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
      {pending ? (isEditing ? "Updating Sale..." : "Creating Sale...") : isEditing ? "Update Sale" : "Create Sale"}
    </Button>
  )
}
