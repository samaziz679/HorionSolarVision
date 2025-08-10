"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createProduct } from "@/app/inventory/actions"
import { toast } from "sonner"

type FieldErrors = Partial<Record<"name" | "description" | "price" | "stock_quantity" | "sku", string[]>>

export default function ProductForm() {
  const [errors, setErrors] = useState<FieldErrors>({})
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)

    try {
      // createProduct previously used with useFormState(prevState, formData)
      const result = await (createProduct as unknown as (_prev: unknown, fd: FormData) => Promise<any>)(
        undefined,
        formData,
      )

      if (result?.errors) {
        setErrors(result.errors as FieldErrors)
        if (result.message) toast.error(result.message)
      } else if (result?.message) {
        toast.error(result.message)
      } else {
        // Reset the form and show success
        e.currentTarget.reset()
        toast.success("Product created successfully!")
      }
    } catch (err) {
      toast.error("Failed to create product.")
      console.error(err)
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Product Name</Label>
        <Input id="name" name="name" type="text" required aria-describedby="name-error" />
        {errors.name && (
          <div id="name-error" aria-live="polite" className="text-sm text-red-500">
            {errors.name.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" aria-describedby="description-error" />
        {errors.description && (
          <div id="description-error" aria-live="polite" className="text-sm text-red-500">
            {errors.description.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="price">Price</Label>
        <Input id="price" name="price" type="number" step="0.01" required aria-describedby="price-error" />
        {errors.price && (
          <div id="price-error" aria-live="polite" className="text-sm text-red-500">
            {errors.price.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="stock_quantity">Stock Quantity</Label>
        <Input
          id="stock_quantity"
          name="stock_quantity"
          type="number"
          required
          aria-describedby="stock-quantity-error"
        />
        {errors.stock_quantity && (
          <div id="stock-quantity-error" aria-live="polite" className="text-sm text-red-500">
            {errors.stock_quantity.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="sku">SKU</Label>
        <Input id="sku" name="sku" type="text" aria-describedby="sku-error" />
        {errors.sku && (
          <div id="sku-error" aria-live="polite" className="text-sm text-red-500">
            {errors.sku.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating..." : "Create Product"}
      </Button>
    </form>
  )
}
