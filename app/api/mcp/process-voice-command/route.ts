import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { command } = await request.json()

    if (!command || typeof command !== "string") {
      return NextResponse.json({ success: false, error: "Invalid command" }, { status: 400 })
    }

    console.log("[v0] Processing voice command:", command)

    // Parse French voice command using regex patterns
    const parsedData = await parseVoiceCommand(command)

    if (!parsedData) {
      return NextResponse.json({ success: false, error: "Command not understood" }, { status: 400 })
    }

    // Validate and enrich data with database lookups
    const enrichedData = await enrichParsedData(parsedData)

    if (!enrichedData) {
      return NextResponse.json({ success: false, error: "Product or client not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      parsedData: enrichedData,
    })
  } catch (error) {
    console.error("[v0] Error processing voice command:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

async function parseVoiceCommand(command: string) {
  const normalizedCommand = command.toLowerCase().trim()

  // French patterns for voice commands
  const patterns = [
    // "Vendre X produit à Client au prix Y"
    /vendre\s+(\d+)\s+(.+?)\s+à\s+(.+?)\s+au\s+prix\s+(grossiste|détail\s*1|détail\s*2|gros)/i,
    // "Créer une vente de X produit pour Client"
    /créer\s+une\s+vente\s+de\s+(\d+)\s+(.+?)\s+pour\s+(.+)/i,
    // "Vendre X produit pour Client au prix Y"
    /vendre\s+(\d+)\s+(.+?)\s+pour\s+(.+?)\s+au\s+prix\s+(grossiste|détail\s*1|détail\s*2|gros)/i,
  ]

  for (const pattern of patterns) {
    const match = normalizedCommand.match(pattern)
    if (match) {
      const quantity = Number.parseInt(match[1])
      const product = match[2].trim()
      const client = match[3].trim()
      const priceType = match[4] ? normalizePriceType(match[4]) : "detail_1"

      return {
        quantity,
        product,
        client,
        priceType,
      }
    }
  }

  return null
}

function normalizePriceType(priceType: string): string {
  const normalized = priceType.toLowerCase().replace(/\s+/g, "")

  if (normalized.includes("grossiste") || normalized.includes("gros")) {
    return "gros"
  } else if (normalized.includes("détail2") || normalized.includes("detail2")) {
    return "detail_2"
  } else {
    return "detail_1"
  }
}

async function enrichParsedData(parsedData: any) {
  const supabase = createClient()

  // Search for product by name (fuzzy matching)
  const { data: products } = await supabase
    .from("products")
    .select("id, name, prix_vente_detail_1, prix_vente_detail_2, prix_vente_gros")
    .ilike("name", `%${parsedData.product}%`)
    .limit(1)

  if (!products || products.length === 0) {
    console.log("[v0] Product not found:", parsedData.product)
    return null
  }

  // Search for client by name (fuzzy matching)
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .ilike("name", `%${parsedData.client}%`)
    .limit(1)

  if (!clients || clients.length === 0) {
    console.log("[v0] Client not found:", parsedData.client)
    return null
  }

  const product = products[0]
  const client = clients[0]

  // Get unit price based on price type
  const priceMapping = {
    detail_1: product.prix_vente_detail_1,
    detail_2: product.prix_vente_detail_2,
    gros: product.prix_vente_gros,
  }

  const unitPrice = priceMapping[parsedData.priceType as keyof typeof priceMapping]
  const total = parsedData.quantity * unitPrice

  return {
    productId: product.id,
    product: product.name,
    clientId: client.id,
    client: client.name,
    quantity: parsedData.quantity,
    priceType: parsedData.priceType,
    unitPrice,
    total,
  }
}
