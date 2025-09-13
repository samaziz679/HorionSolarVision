import { requireRole, getCurrentUserProfile } from "@/lib/auth/rbac"
import { redirect } from "next/navigation"
import { UserManagement } from "@/components/admin/user-management"
import { createSupabaseServerClient } from "@/lib/supabase/server"

async function checkForAdminUsers() {
  const supabase = createSupabaseServerClient()
  const { data: adminUsers } = await supabase.from("user_roles").select("id").eq("role", "admin").eq("status", "active")

  return adminUsers && adminUsers.length > 0
}

export default async function AdminUsersPage() {
  const hasAdminUsers = await checkForAdminUsers()
  const currentUser = await getCurrentUserProfile()

  if (hasAdminUsers) {
    try {
      await requireRole(["admin"])
    } catch (error) {
      redirect("/login")
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
