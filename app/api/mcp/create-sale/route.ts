import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAuthUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({
        success: false,
        error: "Authentification requise",
      })
    }

    const { productId, clientId, quantity, pricePlan, unitPrice } = await request.json()

    if (!productId || !clientId || !quantity || !pricePlan || !unitPrice) {
      return NextResponse.json({
        success: false,
        error: "Données manquantes pour créer la vente",
      })
    }

    const supabase = createClient()
    const total = quantity * unitPrice
    const saleDate = new Date().toISOString()

    // Create the sale
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        product_id: productId,
        client_id: clientId,
        quantity: quantity,
        price_plan: pricePlan,
        unit_price: unitPrice,
        total: total,
        sale_date: saleDate,
        created_by: user.id,
        notes: "Créé via assistant vocal",
      })
      .select()
      .single()

    if (saleError) {
      console.error("Database Error:", saleError)
      return NextResponse.json({
        success: false,
        error: "Erreur lors de la création de la vente",
      })
    }

    // Deduct stock using FIFO method (same logic as in sales actions)
    const stockResult = await deductStockFIFO(supabase, productId, quantity, sale.id, user.id)

    if (!stockResult.success) {
      // If stock deduction fails, delete the sale
      await supabase.from("sales").delete().eq("id", sale.id)
      return NextResponse.json({
        success: false,
        error: stockResult.message || "Stock insuffisant",
      })
    }

    return NextResponse.json({
      success: true,
      saleId: sale.id,
      message: "Vente créée avec succès",
    })
  } catch (error) {
    console.error("Error creating sale:", error)
    return NextResponse.json({
      success: false,
      error: "Erreur interne du serveur",
    })
  }
}

// FIFO stock deduction function (copied from sales actions)
async function deductStockFIFO(
  supabase: any,
  productId: string,
  quantityToDeduct: number,
  saleId: string,
  userId: string,
): Promise<{ success: boolean; message?: string }> {
  // Get available stock lots for the product, ordered by purchase date (FIFO)
  const { data: stockLots, error: fetchError } = await supabase
    .from("stock_lots")
    .select("*")
    .eq("product_id", productId)
    .gt("quantity_remaining", 0)
    .order("purchase_date", { ascending: true })

  if (fetchError) {
    console.error("Error fetching stock lots:", fetchError)
    return { success: false, message: "Failed to fetch stock lots" }
  }

  if (!stockLots || stockLots.length === 0) {
    return { success: false, message: "No stock available for this product" }
  }

  // Check if we have enough total stock
  const totalAvailable = stockLots.reduce((sum, lot) => sum + lot.quantity_remaining, 0)
  if (totalAvailable < quantityToDeduct) {
    return {
      success: false,
      message: `Stock insuffisant. Disponible: ${totalAvailable}, Requis: ${quantityToDeduct}`,
    }
  }

  let remainingToDeduct = quantityToDeduct

  // Deduct from stock lots in FIFO order
  for (const lot of stockLots) {
    if (remainingToDeduct <= 0) break

    const deductFromThisLot = Math.min(remainingToDeduct, lot.quantity_remaining)
    const newAvailableQuantity = lot.quantity_remaining - deductFromThisLot

    // Update stock lot quantity
    const { error: updateError } = await supabase
      .from("stock_lots")
      .update({ quantity_remaining: newAvailableQuantity })
      .eq("id", lot.id)

    if (updateError) {
      console.error("Error updating stock lot:", updateError)
      return { success: false, message: "Failed to update stock lot" }
    }

    // Create stock movement record
    const { error: movementError } = await supabase.from("stock_movements").insert({
      product_id: productId,
      lot_id: lot.id,
      movement_type: "OUT",
      quantity: -deductFromThisLot,
      reference_type: "SALE",
      reference_id: saleId,
      notes: `Vente vocale - Lot: ${lot.lot_number}`,
      created_by: userId,
    })

    if (movementError) {
      console.error("Error creating stock movement:", movementError)
      return { success: false, message: "Failed to record stock movement" }
    }

    remainingToDeduct -= deductFromThisLot
  }

  return { success: true }
}
