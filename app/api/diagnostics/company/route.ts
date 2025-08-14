import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.from("company_settings").select("*").single()

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        hasData: false,
      })
    }

    return NextResponse.json({
      success: true,
      data,
      hasData: !!data,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      hasData: false,
    })
  }
}
