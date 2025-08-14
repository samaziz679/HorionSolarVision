import { requireRole } from "@/lib/auth/rbac"
import { redirect } from "next/navigation"
import { UserManagement } from "@/components/admin/user-management"

export default async function AdminUsersPage() {
  try {
    await requireRole(["admin"])
  } catch (error) {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
        <p className="text-muted-foreground">Gérez les utilisateurs, leurs rôles et permissions dans le système ERP.</p>
      </div>
      <UserManagement />
    </div>
  )
}
