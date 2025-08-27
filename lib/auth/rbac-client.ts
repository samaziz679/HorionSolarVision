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
    return null
  }

  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    const { data: userRole, error } = await supabase.from("user_roles").select("*").eq("user_id", user.id).single()

    if (error || !userRole) {
      return null
    }

    const { data: userProfile } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

    const profile = {
      ...userRole,
      email: userProfile?.email || user.email || "",
      full_name: userProfile?.full_name || "",
    }

    return profile
  } catch (error) {
    console.error("Error in getCurrentUserProfile:", error)
    return null
  }
}

export const getCurrentUserProfileClient = getCurrentUserProfile

export async function getAllUsers(): Promise<UserProfile[]> {
  if (typeof window === "undefined") return []

  try {
    const supabase = createClient()

    const { data: userRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: false })

    if (rolesError) {
      console.error("Error fetching user roles:", rolesError)
      return []
    }

    const { data: userProfiles, error: profilesError } = await supabase.from("user_profiles").select("*")

    if (profilesError) {
      console.warn("Error fetching user profiles:", profilesError)
    }

    const allUsers: UserProfile[] = (userRoles || []).map((userRole) => {
      const userProfile = userProfiles?.find((profile) => profile.user_id === userRole.user_id)

      return {
        id: userRole.id,
        user_id: userRole.user_id,
        role: userRole.role,
        status: userRole.status,
        created_at: userRole.created_at,
        created_by: userRole.created_by,
        email: userProfile?.email || userRole.email || "",
        full_name: userProfile?.full_name || "Non défini",
      }
    })

    return allUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  } catch (error) {
    console.error("Error in getAllUsers:", error)
    return []
  }
}

export async function syncUserRole(
  userId: string,
  email: string,
  role: UserRole = "vendeur",
  status: UserStatus = "active",
): Promise<boolean> {
  if (typeof window === "undefined") return false

  try {
    const supabase = createClient()

    // Check if user role already exists
    const { data: existingRole } = await supabase.from("user_roles").select("id").eq("user_id", userId).single()

    if (existingRole) {
      // Update existing role
      const { error } = await supabase.from("user_roles").update({ role, status }).eq("user_id", userId)
      if (error) throw error
    } else {
      // Create new role entry
      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        role,
        status,
        email,
      })
      if (error) throw error
    }

    return true
  } catch (error) {
    console.error("Error syncing user role:", error)
    return false
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
