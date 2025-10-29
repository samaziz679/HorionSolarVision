import { requireRole, getCurrentUserProfile } from "@/lib/auth/rbac"
import { redirect } from "next/navigation"
import { UserManagement } from "@/components/admin/user-management"
import { createSupabaseServerClient } from "@/lib/supabase/server"

async function checkForAdminUsers() {
  try {
    const supabase = await createSupabaseServerClient(true) // Pass true for service role

    console.log("[v0] Checking for admin users...")

    const { data: adminRoles, error } = await supabase
      .from("user_roles")
      .select("id, role, user_id")
      .eq("role", "admin")

    if (error) {
      console.error("[v0] Error checking for admin users:", error)
      // If there's a database error, assume no admin users exist to allow initial setup
      return false
    }

    console.log("[v0] Admin roles found:", adminRoles?.length || 0)
    console.log("[v0] Admin roles data:", adminRoles)

    return adminRoles && adminRoles.length > 0
  } catch (error) {
    console.error("[v0] Exception in checkForAdminUsers:", error)
    // If there's any exception, assume no admin users exist to allow initial setup
    return false
  }
}

export default async function AdminUsersPage() {
  const hasAdminUsers = await checkForAdminUsers()
  const currentUser = await getCurrentUserProfile()

  console.log("[v0] Has admin users:", hasAdminUsers)
  console.log("[v0] Current user:", currentUser?.email, currentUser?.role)

  if (hasAdminUsers) {
    try {
      await requireRole(["admin"])
    } catch (error) {
      console.log("[v0] Role check failed, redirecting to dashboard")
      redirect("/dashboard")
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
        <p className="text-muted-foreground">
          {!hasAdminUsers
            ? "Configuration initiale - Créez votre premier compte administrateur"
            : "Gérez les utilisateurs, leurs rôles et permissions dans le système ERP."}
        </p>
      </div>
      <UserManagement initialSetup={!hasAdminUsers} />
    </div>
  )
}
