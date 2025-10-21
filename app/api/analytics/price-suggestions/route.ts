import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getPriceSuggestions } from "@/lib/data/margin-analytics"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const searchParams = request.nextUrl.searchParams
    const targetMargin = Number(searchParams.get("targetMargin")) || 30
    const period = searchParams.get("period") || "12-months"

    console.log("[v0] Fetching price suggestions with target margin:", targetMargin, "period:", period)

    // Get current user's company
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single()

    if (!profile?.company_id) {
      return NextResponse.json({ error: "No company found" }, { status: 404 })
    }

    // Calculate price suggestions with the new target margin
    const suggestions = await getPriceSuggestions(supabase, profile.company_id, period, targetMargin)

    console.log("[v0] Calculated", suggestions.length, "price suggestions")

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("[v0] Error in price suggestions API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
