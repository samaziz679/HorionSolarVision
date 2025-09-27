import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAuthUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const saleData = await request.json()

    if (!saleData.productId || !saleData.clientId || !saleData.quantity || !saleData.unitPrice) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] Creating sale via MCP:", saleData)

    const supabase = createClient()

    // Create the sale
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        product_id: saleData.productId,
        client_id: saleData.clientId,
        quantity: saleData.quantity,
        price_plan: saleData.priceType,
        unit_price: saleData.unitPrice,
        total: saleData.total,
        sale_date: new Date().toISOString().split("T")[0],
        created_by: user.id,
        notes: "Créé via assistant vocal",
      })
      .select()
      .single()

    if (saleError) {
      console.error("[v0] Error creating sale:", saleError)
      return NextResponse.json({ success: false, error: "Failed to create sale" }, { status: 500 })
    }

    // TODO: Implement stock deduction (FIFO) - for now we'll skip it to avoid complexity
    // In a full implementation, you would call the deductStockFIFO function here

    console.log("[v0] Sale created successfully:", sale.id)

    return NextResponse.json({
      success: true,
      sale: {
        id: sale.id,
        total: sale.total,
        product: saleData.product,
        client: saleData.client,
        quantity: saleData.quantity,
      },
    })
  } catch (error) {
    console.error("[v0] Error in MCP create sale:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
