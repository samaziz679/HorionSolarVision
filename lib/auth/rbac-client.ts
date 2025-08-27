import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/lib/supabase/types"

export type UserRole = "admin" | "manager" | "vendeur"
export type UserStatus = "active" | "suspended" | "pending"

export interface UserProfile {
  id: string
  user_id: string
  role: UserRole
  status: UserStatus // Added missing status field
  created_at: string
  created_by?: string
  email?: string // Will be fetched from auth.users
  full_name?: string // Added missing full_name field
}

export const ROLE_PERMISSIONS = {
  admin: {
    modules: [
      "dashboard",
      "inventory",
      "sales",
      "purchases",
      "clients",
      "suppliers",
      "expenses",
      "reports",
      "settings",
      "admin",
    ],
  },
  manager: {
    modules: [
      "dashboard",
      "inventory",
      "sales",
      "purchases",
      "clients",
      "suppliers",
      "expenses",
      "reports",
      "settings",
    ],
  },
  vendeur: {
    modules: ["dashboard", "sales", "clients"],
  },
} as const

const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  if (typeof window === "undefined") {
    console.log("RBAC Debug: Running on server side, returning null")
    return null
  }

  try {
    const supabase = createClient()
    console.log("RBAC Debug: Created Supabase client")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log("RBAC Debug: Auth user:", user ? { id: user.id, email: user.email } : "No user")

    if (!user) {
      console.log("RBAC Debug: No authenticated user found")
      return null
    }

    console.log("RBAC Debug: Fetching user role for user:", user.id)

    const { data: userRole, error } = await supabase.from("user_roles").select("*").eq("user_id", user.id).single()

    console.log("RBAC Debug: Database query result:", { data: userRole, error })

    if (error) {
      console.error("RBAC Debug: Error fetching user role:", error)
      return null
    }

    if (!userRole) {
      console.log("RBAC Debug: No user role found in database")
      return null
    }

    const profile = {
      ...userRole,
      email: userRole.email || user.email || "",
      full_name: userRole.full_name || "",
    }

    console.log("RBAC Debug: Final user profile:", profile)
    console.log("RBAC Debug: Profile status check:", profile.status, "=== 'active':", profile.status === "active")

    return profile
  } catch (error) {
    console.error("RBAC Debug: Exception in getCurrentUserProfile:", error)
    return null
  }
}

export const getCurrentUserProfileClient = getCurrentUserProfile

export async function getAllUsers(): Promise<UserProfile[]> {
  if (typeof window === "undefined") return []

  try {
    const supabase = createClient()
    const { data: userRoles, error } = await supabase
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    // Get user emails from auth.users
    const usersWithEmails = await Promise.all(
      (userRoles || []).map(async (userRole) => {
        const { data: authUser } = await supabase.auth.admin.getUserById(userRole.user_id)
        return {
          ...userRole,
          email: authUser.user?.email || "",
          full_name: authUser.user?.full_name || "", // Added full_name field
        }
      }),
    )

    return usersWithEmails
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export async function updateUserRole(userId: string, role: UserRole): Promise<boolean> {
  if (typeof window === "undefined") return false

  try {
    const supabase = createClient()
    const { error } = await supabase.from("user_roles").update({ role }).eq("user_id", userId)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error updating user role:", error)
    return false
  }
}

export async function updateUserStatus(userId: string, status: UserStatus): Promise<boolean> {
  if (typeof window === "undefined") return false

  try {
    const supabase = createClient()
    const { error } = await supabase.from("user_roles").update({ status }).eq("user_id", userId)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error updating user status:", error)
    return false
  }
}

export function hasPermission(userRole: UserRole, requiredPermission: string): boolean {
  const rolePermissions = {
    admin: ["*"], // Admin has all permissions
    manager: [
      "dashboard.view",
      "sales.view",
      "sales.create",
      "clients.view",
      "clients.create",
      "clients.edit",
      "inventory.view",
      "inventory.create",
      "inventory.edit",
      "purchases.view",
      "purchases.create",
      "purchases.edit",
      "suppliers.view",
      "suppliers.create",
      "suppliers.edit",
      "expenses.view",
      "expenses.create",
      "expenses.edit",
      "reports.view",
    ],
    vendeur: ["dashboard.view", "sales.view", "sales.create", "clients.view", "clients.create"],
  }

  const permissions = rolePermissions[userRole] || []
  return permissions.includes("*") || permissions.includes(requiredPermission)
}
