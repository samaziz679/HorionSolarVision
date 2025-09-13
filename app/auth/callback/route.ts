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
        const { count: profileCount } = await supabase.from("user_profiles").select("*", { count: "exact", head: true })

        const isFirstUse = profileCount === 0 || profileCount === null

        if (isFirstUse) {
          console.log("[v0] Creating first admin user profile for:", user.email)

          // Create user profile
          const { data: newProfile, error: profileError } = await supabase
            .from("user_profiles")
            .insert({
              user_id: user.id,
              email: user.email,
              full_name: user.email?.split("@")[0] || "Admin",
              status: "active",
            })
            .select()
            .single()

          if (profileError) {
            console.error("[v0] Failed to create user profile:", profileError)
            return NextResponse.redirect(`${origin}/auth/auth-code-error?error=profile_creation_failed`)
          }

          // Create admin role
          const { error: roleError } = await supabase.from("user_roles").insert({
            user_id: user.id,
            role: "admin",
            status: "active",
          })

          if (roleError) {
            console.error("[v0] Failed to create user role:", roleError)
            return NextResponse.redirect(`${origin}/auth/auth-code-error?error=role_creation_failed`)
          }

          // Log successful first admin creation
          await supabase.from("audit_logs").insert({
            user_id: user.id,
            action: "FIRST_ADMIN_CREATED",
            table_name: "user_profiles",
            record_id: newProfile.id,
            new_values: { email: user.email, role: "admin" },
            user_agent: request.headers.get("user-agent"),
          })

          return NextResponse.redirect(`${origin}${next}`)
        }

        const { data: userProfile, error: profileError } = await supabase
          .from("user_profiles")
          .select("id, email, status")
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

        // Check user role
        const { data: userRole, error: roleError } = await supabase
          .from("user_roles")
          .select("role, status")
          .eq("user_id", user.id)
          .single()

        if (roleError || !userRole) {
          await supabase.from("unauthorized_attempts").insert({
            user_id: user.id,
            attempted_resource: "callback_no_role",
            user_role: null,
            user_agent: request.headers.get("user-agent"),
          })

          await supabase.auth.signOut()
          return NextResponse.redirect(
            `${origin}/auth/auth-code-error?error=access_denied&error_description=No user role found`,
          )
        }

        if (userProfile.status !== "active" || userRole.status !== "active") {
          // User has profile but is not active
          await supabase.from("unauthorized_attempts").insert({
            user_id: user.id,
            attempted_resource: "callback_inactive",
            user_role: userRole.role,
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
          new_values: { email: user.email, role: userRole.role },
          user_agent: request.headers.get("user-agent"),
        })
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
