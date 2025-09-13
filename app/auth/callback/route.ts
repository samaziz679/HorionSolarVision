import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Check if user has a valid profile in our system
        const { data: userProfile, error: profileError } = await supabase
          .from("user_roles")
          .select("id, status, role")
          .eq("user_id", user.id)
          .single()

        if (profileError || !userProfile) {
          // User authenticated with Supabase but has no profile in our system
          await supabase.from("unauthorized_attempts").insert({
            user_id: user.id,
            attempted_resource: "callback_no_profile",
            user_role: null,
            user_agent: request.headers.get("user-agent"),
          })

          // Sign out the user and redirect to error
          await supabase.auth.signOut()
          return NextResponse.redirect(
            `${origin}/auth/auth-code-error?error=access_denied&error_description=No user profile found`,
          )
        }

        if (userProfile.status !== "active") {
          // User has profile but is not active
          await supabase.from("unauthorized_attempts").insert({
            user_id: user.id,
            attempted_resource: "callback_inactive",
            user_role: userProfile.role,
            user_agent: request.headers.get("user-agent"),
          })

          await supabase.auth.signOut()
          return NextResponse.redirect(
            `${origin}/auth/auth-code-error?error=access_denied&error_description=Account not active`,
          )
        }

        // Log successful login
        await supabase.from("audit_logs").insert({
          user_id: user.id,
          action: "LOGIN_SUCCESS",
          table_name: "auth",
          record_id: user.id,
          new_values: { email: user.email, role: userProfile.role },
          user_agent: request.headers.get("user-agent"),
        })
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
