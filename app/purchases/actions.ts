"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"

const FormSchema = z.object({
  id: z.string(),
  product_id: z.string().min(1, "Product is required."),
  supplier_id: z.string().min(1, "Supplier is required."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
  unit_price: z.coerce.number().min(0, "Unit price cannot be negative."),
  total: z.coerce.number().min(0, "Total cannot be negative."),
  purchase_date: z.string().min(1, "Purchase date is required."),
})

const CreatePurchaseSchema = FormSchema.omit({ id: true })
const UpdatePurchaseSchema = FormSchema

export type State = {
  errors?: {
    product_id?: string[]
    supplier_id?: string[]
    quantity?: string[]
    unit_price?: string[]
    total?: string[]
    purchase_date?: string[]
  }
  message?: string | null
  success?: boolean
}

export async function createPurchase(prevState: State, formData: FormData) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const validatedFields = CreatePurchaseSchema.safeParse({
    product_id: formData.get("product_id"),
    supplier_id: formData.get("supplier_id"),
    quantity: formData.get("quantity"),
    unit_price: formData.get("unit_price"),
    total: formData.get("total"),
    purchase_date: formData.get("purchase_date"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to create purchase.",
      success: false,
    }
  }

  const { product_id, supplier_id, quantity, unit_price, total, purchase_date } = validatedFields.data

  const supabase = createClient()

  const { data: purchase, error: purchaseError } = await supabase
    .from("purchases")
    .insert({
      created_by: user.id,
      product_id,
      supplier_id,
      quantity,
      unit_price,
      total,
      purchase_date,
    })
    .select()
    .single()

  if (purchaseError) {
    console.error("Database Error:", purchaseError)
    return { message: "Database Error: Failed to create purchase.", success: false }
  }

  const { error: stockLotError } = await supabase.from("stock_lots").insert({
    product_id,
    purchase_id: purchase.id,
    quantity_received: quantity, // Changed from quantity_purchased
    quantity_remaining: quantity, // Fixed column name from quantity_available to quantity_remaining
    unit_cost: unit_price,
    purchase_date,
    created_by: user.id,
  })

  if (stockLotError) {
    console.error("Stock Lot Error:", stockLotError)
    // If stock lot creation fails, we should ideally rollback the purchase
    // For now, we'll continue but log the error
    console.error("Warning: Purchase created but stock lot creation failed")
  }

  revalidatePath("/purchases")
  revalidatePath("/inventory")
  redirect("/purchases")
}

export async function updatePurchase(id: string, prevState: State, formData: FormData) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const validatedFields = UpdatePurchaseSchema.safeParse({
    id: id,
    product_id: formData.get("product_id"),
    supplier_id: formData.get("supplier_id"),
    quantity: formData.get("quantity"),
    unit_price: formData.get("unit_price"),
    total: formData.get("total"),
    purchase_date: formData.get("purchase_date"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to update purchase.",
      success: false,
    }
  }

  const { product_id, supplier_id, quantity, unit_price, total, purchase_date } = validatedFields.data
  const supabase = createClient()

  const { data: originalPurchase, error: fetchError } = await supabase
    .from("purchases")
    .select("*")
    .eq("id", id)
    .single()

  if (fetchError) {
    console.error("Database Error:", fetchError)
    return { message: "Database Error: Failed to fetch original purchase.", success: false }
  }

  const { data: stockLot, error: stockLotFetchError } = await supabase
    .from("stock_lots")
    .select("quantity_received, quantity_remaining") // Fixed column name from quantity_available to quantity_remaining
    .eq("purchase_id", id)
    .single()

  if (stockLotFetchError) {
    console.error("Stock Lot Fetch Error:", stockLotFetchError)
    return { message: "Database Error: Failed to check stock lot status.", success: false }
  }

  const consumedQuantity = stockLot.quantity_received - stockLot.quantity_remaining // Fixed column name

  if (quantity < consumedQuantity) {
    return {
      message: `Cannot reduce quantity to ${quantity}. ${consumedQuantity} items from this batch have already been sold. Minimum allowed quantity: ${consumedQuantity}`,
      success: false,
    }
  }

  if (originalPurchase.product_id !== product_id && consumedQuantity > 0) {
    return {
      message: `Cannot change product. ${consumedQuantity} items from this batch have already been sold.`,
      success: false,
    }
  }

  const { error } = await supabase
    .from("purchases")
    .update({
      product_id,
      supplier_id,
      quantity,
      unit_price,
      total,
      purchase_date,
    })
    .eq("id", id)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to update purchase.", success: false }
  }

  if (originalPurchase.quantity !== quantity || originalPurchase.unit_price !== unit_price) {
    const newAvailableQuantity = quantity - consumedQuantity

    const { error: stockLotError } = await supabase
      .from("stock_lots")
      .update({
        quantity_received: quantity,
        quantity_remaining: newAvailableQuantity, // Fixed column name from quantity_available to quantity_remaining
        unit_cost: unit_price,
        purchase_date,
      })
      .eq("purchase_id", id)

    if (stockLotError) {
      console.error("Stock Lot Update Error:", stockLotError)
      return { message: "Database Error: Failed to update stock lot.", success: false }
    }
  }

  revalidatePath("/purchases")
  revalidatePath(`/purchases/${id}/edit`)
  revalidatePath("/inventory")
  redirect("/purchases")
}

export async function deletePurchase(id: string) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const supabase = createClient()

  const { data: stockLot, error: stockLotFetchError } = await supabase
    .from("stock_lots")
    .select("quantity_received, quantity_remaining") // Fixed column name from quantity_available to quantity_remaining
    .eq("purchase_id", id)
    .single()

  if (stockLotFetchError && stockLotFetchError.code !== "PGRST116") {
    console.error("Database Error:", stockLotFetchError)
    return { message: "Database Error: Failed to check stock lot status.", success: false }
  }

  if (stockLot && stockLot.quantity_remaining < stockLot.quantity_received) {
    // Fixed column name
    // Changed from quantity_purchased
    return {
      message: "Cannot delete purchase: Some items from this batch have already been sold.",
      success: false,
    }
  }

  const { error } = await supabase.from("purchases").delete().eq("id", id)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to delete purchase.", success: false }
  }

  revalidatePath("/purchases")
  revalidatePath("/inventory")
  return { message: "Purchase deleted successfully.", success: true }
}

interface BulkPurchaseRow {
  product_name: string
  supplier_name: string
  quantity: number
  unit_price: number
  purchase_date?: string
  prix_vente_detail_1?: number
  prix_vente_detail_2?: number
  prix_vente_gros?: number
}

interface PreviewRow extends BulkPurchaseRow {
  rowNumber: number
  productStatus: "exists" | "will_create"
  supplierStatus: "exists" | "will_create"
  errors: string[]
  productId?: string
  supplierId?: string
}

export async function previewBulkPurchases(purchases: BulkPurchaseRow[]) {
  const user = await getAuthUser()
  if (!user) {
    return { success: false, errors: ["Authentication error. Please sign in."], preview: [] }
  }

  const supabase = createClient()

  const { data: existingProducts } = await supabase.from("products").select("id, name")
  const { data: existingSuppliers } = await supabase.from("suppliers").select("id, name")

  if (!existingProducts || !existingSuppliers) {
    return { success: false, errors: ["Failed to load existing products or suppliers"], preview: [] }
  }

  const productMap = new Map(existingProducts.map((p) => [p.name.toLowerCase(), p]))
  const supplierMap = new Map(existingSuppliers.map((s) => [s.name.toLowerCase(), s]))

  const preview: PreviewRow[] = purchases.map((row, index) => {
    const rowNumber = index + 2 // +2 because CSV has header and arrays are 0-indexed
    const errors: string[] = []

    // Check product
    const product = productMap.get(row.product_name.toLowerCase())
    const productStatus = product ? "exists" : "will_create"

    // Check supplier
    const supplier = supplierMap.get(row.supplier_name.toLowerCase())
    const supplierStatus = supplier ? "exists" : "will_create"

    // Validate data
    if (!row.product_name?.trim()) {
      errors.push("Nom du produit requis")
    }
    if (!row.supplier_name?.trim()) {
      errors.push("Nom du fournisseur requis")
    }
    if (row.quantity <= 0) {
      errors.push("Quantité doit être positive")
    }
    if (row.unit_price < 0) {
      errors.push("Prix unitaire ne peut pas être négatif")
    }
    if (row.purchase_date && !/^\d{4}-\d{2}-\d{2}$/.test(row.purchase_date)) {
      errors.push("Format de date invalide (YYYY-MM-DD)")
    }

    return {
      ...row,
      rowNumber,
      productStatus,
      supplierStatus,
      errors,
      productId: product?.id,
      supplierId: supplier?.id,
    }
  })

  return {
    success: true,
    errors: [],
    preview,
  }
}

export async function bulkCreatePurchases(purchases: BulkPurchaseRow[]) {
  console.log("[v0] Starting bulk import with", purchases.length, "rows")

  const user = await getAuthUser()
  if (!user) {
    return { success: 0, errors: ["Authentication error. Please sign in."] }
  }

  const supabase = createClient()
  let successCount = 0
  const errors: string[] = []
  const createdItems: string[] = []

  const { data: existingProducts } = await supabase.from("products").select("id, name")
  const { data: existingSuppliers } = await supabase.from("suppliers").select("id, name")

  if (!existingProducts || !existingSuppliers) {
    return { success: 0, errors: ["Failed to load existing products or suppliers"] }
  }

  const productMap = new Map(existingProducts.map((p) => [p.name.toLowerCase(), p]))
  const supplierMap = new Map(existingSuppliers.map((s) => [s.name.toLowerCase(), s]))

  // Process each purchase
  for (let i = 0; i < purchases.length; i++) {
    const row = purchases[i]
    const rowNum = i + 2 // +2 because CSV has header and arrays are 0-indexed

    console.log(`[v0] Processing row ${rowNum}:`, {
      product_name: row.product_name,
      supplier_name: row.supplier_name,
      quantity: row.quantity,
      unit_price: row.unit_price,
    })

    try {
      let supplier = supplierMap.get(row.supplier_name.toLowerCase())
      if (!supplier) {
        console.log(`[v0] Creating new supplier: ${row.supplier_name}`)

        const { data: newSupplier, error: supplierError } = await supabase
          .from("suppliers")
          .insert({
            name: row.supplier_name,
            created_by: user.id,
          })
          .select("id, name")
          .single()

        if (supplierError) {
          console.log(`[v0] Supplier creation error:`, supplierError)
          errors.push(`Ligne ${rowNum}: Erreur création fournisseur "${row.supplier_name}" - ${supplierError.message}`)
          continue
        }

        supplier = newSupplier
        supplierMap.set(row.supplier_name.toLowerCase(), supplier)
        createdItems.push(`Fournisseur créé: ${row.supplier_name}`)
        console.log(`[v0] Supplier created successfully:`, supplier)
      }

      let product = productMap.get(row.product_name.toLowerCase())
      if (!product) {
        console.log(`[v0] Creating new product: ${row.product_name}`)

        const { data: newProduct, error: productError } = await supabase
          .from("products")
          .insert({
            name: row.product_name,
            quantity: 0, // Will be updated by stock lot creation
            prix_achat: row.unit_price,
            prix_vente_detail_1: row.prix_vente_detail_1,
            prix_vente_detail_2: row.prix_vente_detail_2,
            prix_vente_gros: row.prix_vente_gros,
            created_by: user.id,
          })
          .select("id, name")
          .single()

        if (productError) {
          console.log(`[v0] Product creation error:`, productError)
          errors.push(`Ligne ${rowNum}: Erreur création produit "${row.product_name}" - ${productError.message}`)
          continue
        }

        product = newProduct
        productMap.set(row.product_name.toLowerCase(), product)
        createdItems.push(`Produit créé: ${row.product_name}`)
        console.log(`[v0] Product created successfully:`, product)
      } else {
        const updateData: any = {}
        if (row.prix_vente_detail_1) updateData.prix_vente_detail_1 = row.prix_vente_detail_1
        if (row.prix_vente_detail_2) updateData.prix_vente_detail_2 = row.prix_vente_detail_2
        if (row.prix_vente_gros) updateData.prix_vente_gros = row.prix_vente_gros

        if (Object.keys(updateData).length > 0) {
          await supabase.from("products").update(updateData).eq("id", product.id)
        }
      }

      // Validate data
      if (row.quantity <= 0) {
        errors.push(`Ligne ${rowNum}: Quantité doit être positive`)
        continue
      }

      if (row.unit_price < 0) {
        errors.push(`Ligne ${rowNum}: Prix unitaire ne peut pas être négatif`)
        continue
      }

      const total = row.quantity * row.unit_price
      const purchaseDate = row.purchase_date || new Date().toISOString().split("T")[0]

      console.log(`[v0] Creating purchase for row ${rowNum}:`, {
        product_id: product.id,
        supplier_id: supplier.id,
        quantity: row.quantity,
        unit_price: row.unit_price,
        total: total,
        purchase_date: purchaseDate,
      })

      // Create purchase
      const { data: purchase, error: purchaseError } = await supabase
        .from("purchases")
        .insert({
          created_by: user.id,
          product_id: product.id,
          supplier_id: supplier.id,
          quantity: row.quantity,
          unit_price: row.unit_price,
          total: total,
          purchase_date: purchaseDate,
        })
        .select()
        .single()

      if (purchaseError) {
        console.log(`[v0] Purchase creation error for row ${rowNum}:`, purchaseError)
        errors.push(`Ligne ${rowNum}: Erreur création achat - ${purchaseError.message}`)
        continue
      }

      console.log(`[v0] Purchase created successfully for row ${rowNum}:`, purchase)

      const stockLotData = {
        product_id: product.id,
        purchase_id: purchase.id,
        quantity_received: row.quantity,
        quantity_remaining: row.quantity, // Fixed column name from quantity_available to quantity_remaining
        unit_cost: row.unit_price,
        purchase_date: purchaseDate,
        created_by: user.id,
      }

      console.log(`[v0] Creating stock lot for row ${rowNum} with data:`, stockLotData)

      // Create stock lot
      const { error: stockLotError } = await supabase.from("stock_lots").insert(stockLotData)

      if (stockLotError) {
        console.log(`[v0] Stock lot creation error for row ${rowNum}:`, stockLotError)
        errors.push(`Ligne ${rowNum}: Erreur création lot - ${stockLotError.message}`)
        continue
      }

      console.log(`[v0] Stock lot created successfully for row ${rowNum}`)
      successCount++
    } catch (error) {
      console.log(`[v0] Unexpected error for row ${rowNum}:`, error)
      errors.push(`Ligne ${i + 2}: Erreur inattendue - ${error}`)
    }
  }

  console.log(`[v0] Bulk import completed. Success: ${successCount}, Errors: ${errors.length}`)
  console.log(`[v0] Created items:`, createdItems)
  console.log(`[v0] Errors:`, errors)

  // Revalidate paths if any purchases were successful
  if (successCount > 0) {
    revalidatePath("/purchases")
    revalidatePath("/inventory")
  }

  return {
    success: successCount,
    errors,
    created: createdItems,
  }
}
