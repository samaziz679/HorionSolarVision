import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface ParsedCommand {
  product: string
  quantity: number
  client: string
  priceType: string
}

export async function POST(request: NextRequest) {
  try {
    const { command } = await request.json()

    if (!command || typeof command !== "string") {
      return NextResponse.json({
        success: false,
        error: "Commande vocale manquante",
      })
    }

    // Parse French voice command
    const parsedData = parseVoiceCommand(command.toLowerCase())

    if (!parsedData) {
      return NextResponse.json({
        success: false,
        error: 'Format de commande non reconnu. Utilisez: "Vendre [quantité] [produit] à [client] au [prix]"',
      })
    }

    // Validate against database
    const supabase = createClient()

    // Find matching product
    const { data: products } = await supabase
      .from("products")
      .select("id, name, prix_vente_gros, prix_vente_detail_1, prix_vente_detail_2")
      .ilike("name", `%${parsedData.product}%`)

    if (!products || products.length === 0) {
      return NextResponse.json({
        success: false,
        error: `Produit "${parsedData.product}" non trouvé dans l'inventaire`,
      })
    }

    // Find matching client
    const { data: clients } = await supabase.from("clients").select("id, name").ilike("name", `%${parsedData.client}%`)

    if (!clients || clients.length === 0) {
      return NextResponse.json({
        success: false,
        error: `Client "${parsedData.client}" non trouvé. Veuillez d'abord l'ajouter dans la section Clients`,
      })
    }

    // Determine price based on price type
    const product = products[0]
    let unitPrice = 0
    let pricePlan = ""

    switch (parsedData.priceType) {
      case "grossiste":
      case "gros":
        unitPrice = product.prix_vente_gros || 0
        pricePlan = "wholesale"
        break
      case "détail":
      case "detail":
        unitPrice = product.prix_vente_detail_1 || 0
        pricePlan = "retail"
        break
      default:
        unitPrice = product.prix_vente_detail_1 || 0
        pricePlan = "retail"
    }

    return NextResponse.json({
      success: true,
      parsedData: {
        product: product.name,
        productId: product.id,
        quantity: parsedData.quantity,
        client: clients[0].name,
        clientId: clients[0].id,
        priceType: parsedData.priceType,
        pricePlan,
        unitPrice,
      },
    })
  } catch (error) {
    console.error("Error processing voice command:", error)
    return NextResponse.json({
      success: false,
      error: "Erreur interne du serveur",
    })
  }
}

function parseVoiceCommand(command: string): ParsedCommand | null {
  // Remove common French articles and prepositions
  const cleanCommand = command
    .replace(/\b(le|la|les|un|une|des|du|de|d')\b/g, "")
    .replace(/\s+/g, " ")
    .trim()

  // Pattern: "vendre [quantity] [product] à [client] au [price_type]"
  const patterns = [
    /vendre\s+(\d+)\s+(.+?)\s+à\s+(.+?)\s+au\s+prix\s+(grossiste|gros|détail|detail)/,
    /vendre\s+(\d+)\s+(.+?)\s+à\s+(.+?)\s+au\s+(grossiste|gros|détail|detail)/,
    /vendre\s+(\d+)\s+(.+?)\s+à\s+(.+?)\s+(grossiste|gros|détail|detail)/,
  ]

  for (const pattern of patterns) {
    const match = cleanCommand.match(pattern)
    if (match) {
      const [, quantityStr, product, client, priceType] = match
      const quantity = Number.parseInt(quantityStr, 10)

      if (quantity > 0) {
        return {
          product: product.trim(),
          quantity,
          client: client.trim(),
          priceType: priceType.trim(),
        }
      }
    }
  }

  return null
}
