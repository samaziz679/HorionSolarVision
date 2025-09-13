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

          const { data: newProfile, error: profileError } = await supabase
            .from("user_profiles")
            .insert({
              user_id: user.id,
              email: user.email,
              full_name: user.email?.split("@")[0] || "Admin",
              status: "active",
              created_by: user.id,
            })
            .select()
            .single()

          if (profileError) {
            console.error("[v0] Failed to create user profile:", profileError)
            return NextResponse.redirect(`${origin}/auth/auth-code-error?error=profile_creation_failed`)
          }

          const { error: roleError } = await supabase.from("user_roles").insert({
            user_id: user.id,
            role: "admin",
            created_by: user.id,
          })

          if (roleError) {
            console.error("[v0] Failed to create user role:", roleError)
            return NextResponse.redirect(`${origin}/auth/auth-code-error?error=role_creation_failed`)
          }

          console.log("[v0] First admin user created successfully:", user.email)

          return NextResponse.redirect(`${origin}${next}`)
        }

        const { data: userProfile, error: profileError } = await supabase
          .from("user_profiles")
          .select("id, email, status")
          .eq("user_id", user.id)
          .single()

        if (profileError || !userProfile) {
          // User authenticated with Supabase but has no profile in our system
          console.error("[v0] No user profile found for:", user.email)

          // Sign out the user and redirect to error
          await supabase.auth.signOut()
          return NextResponse.redirect(
            `${origin}/auth/auth-code-error?error=access_denied&error_description=No user profile found`,
          )
        }

        const { data: userRole, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single()

        if (roleError || !userRole) {
          console.error("[v0] No user role found for:", user.email)

          await supabase.auth.signOut()
          return NextResponse.redirect(
            `${origin}/auth/auth-code-error?error=access_denied&error_description=No user role found`,
          )
        }

        if (userProfile.status !== "active") {
          console.error("[v0] User profile not active:", user.email)

          await supabase.auth.signOut()
          return NextResponse.redirect(
            `${origin}/auth/auth-code-error?error=access_denied&error_description=Account not active`,
          )
        }

        console.log("[v0] User login successful:", user.email, "Role:", userRole.role)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
