import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getPendingUsers } from "@/lib/auth/rbac"

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()

    // Verify admin access
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userRole } = await supabase.from("user_roles").select("role").eq("user_id", user.id).single()

    if (!userRole || userRole.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const pendingUsers = await getPendingUsers()
    return NextResponse.json({ pendingUsers })
  } catch (error) {
    console.error("Error fetching pending users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
