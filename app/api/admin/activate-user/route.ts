import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { activateUser } from "@/lib/auth/rbac"

export async function POST(request: NextRequest) {
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

    const { userId, email, fullName, role } = await request.json()

    if (!userId || !email || !fullName || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const success = await activateUser(userId, email, fullName, role)

    if (!success) {
      return NextResponse.json({ error: "Failed to activate user" }, { status: 500 })
    }

    // Log the activation
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "ACTIVATE_USER",
      table_name: "user_profiles",
      record_id: userId,
      old_values: null,
      new_values: {
        email,
        full_name: fullName,
        role,
        status: "active",
      },
      user_agent: request.headers.get("user-agent"),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error activating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
