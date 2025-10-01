import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/lib/supabase/types"

export type UserRole = "admin" | "stock_manager" | "commercial" | "finance" | "visitor" | "seller"
export type UserStatus = "active" | "suspended" | "pending"

export interface UserProfile {
  id: string
  user_id: string
  role: UserRole
  status: UserStatus
  created_at: string
  created_by?: string
  email?: string
  full_name?: string
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
      "solar-sizer",
    ],
  },
  stock_manager: {
    modules: ["dashboard", "inventory", "purchases", "suppliers", "reports"],
  },
  commercial: {
    modules: ["dashboard", "sales", "clients", "reports"],
  },
  finance: {
    modules: ["dashboard", "expenses", "reports", "sales", "purchases"],
  },
  visitor: {
    modules: ["dashboard"],
  },
  seller: {
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
      console.log("[v0] RBAC: No authenticated user found")
      return null
    }

    console.log("[v0] RBAC: Authenticated user ID:", user.id)

    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("id, user_id, role, created_by, created_at")
      .eq("user_id", user.id)
      .single()

    if (roleError || !userRole) {
      console.log("[v0] RBAC: No role found for user:", roleError?.message)
      return null
    }

    console.log("[v0] RBAC: User role found:", userRole.role)

    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("email, full_name, status")
      .eq("user_id", user.id)
      .single()

    if (profileError) {
      console.log("[v0] RBAC: No profile found, using defaults:", profileError.message)
    }

    const profile: UserProfile = {
      id: userRole.id,
      user_id: userRole.user_id,
      role: userRole.role,
      status: (userProfile?.status as UserStatus) || "active", // Status comes from user_profiles
      created_at: userRole.created_at,
      created_by: userRole.created_by,
      email: userProfile?.email || user.email || "",
      full_name: userProfile?.full_name || "",
    }

    console.log("[v0] RBAC: Final profile:", {
      role: profile.role,
      status: profile.status,
      email: profile.email,
      modules: ROLE_PERMISSIONS[profile.role].modules,
    })

    return profile
  } catch (error) {
    console.error("[v0] RBAC: Error in getCurrentUserProfile:", error)
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
      .select("id, user_id, role, created_by, created_at")
      .order("created_at", { ascending: false })

    if (rolesError) {
      console.error("[v0] RBAC: Error fetching user roles:", rolesError)
      return []
    }

    const { data: userProfiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("user_id, email, full_name, status")

    if (profilesError) {
      console.warn("[v0] RBAC: Error fetching user profiles:", profilesError)
    }

    const allUsers: UserProfile[] = (userRoles || []).map((userRole) => {
      const userProfile = userProfiles?.find((profile) => profile.user_id === userRole.user_id)

      return {
        id: userRole.id,
        user_id: userRole.user_id,
        role: userRole.role,
        status: (userProfile?.status as UserStatus) || "active", // Status from user_profiles
        created_at: userRole.created_at,
        created_by: userRole.created_by,
        email: userProfile?.email || "",
        full_name: userProfile?.full_name || "Non défini",
      }
    })

    return allUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  } catch (error) {
    console.error("[v0] RBAC: Error in getAllUsers:", error)
    return []
  }
}

export async function syncUserRole(
  userId: string,
  email: string,
  role: UserRole = "seller",
  status: UserStatus = "active",
): Promise<boolean> {
  if (typeof window === "undefined") return false

  try {
    const supabase = createClient()

    const { data: existingRole } = await supabase.from("user_roles").select("id").eq("user_id", userId).single()

    if (existingRole) {
      const { error } = await supabase.from("user_roles").update({ role }).eq("user_id", userId)
      if (error) throw error
    } else {
      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        role,
      })
      if (error) throw error
    }

    const { data: existingProfile } = await supabase.from("user_profiles").select("id").eq("user_id", userId).single()

    if (existingProfile) {
      const { error } = await supabase.from("user_profiles").update({ status }).eq("user_id", userId)
      if (error) throw error
    } else {
      const { error } = await supabase.from("user_profiles").insert({
        user_id: userId,
        email,
        status,
      })
      if (error) throw error
    }

    return true
  } catch (error) {
    console.error("[v0] RBAC: Error syncing user role:", error)
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
    console.error("[v0] RBAC: Error updating user role:", error)
    return false
  }
}

export async function updateUserStatus(userId: string, status: UserStatus): Promise<boolean> {
  if (typeof window === "undefined") return false

  try {
    const supabase = createClient()
    const { error } = await supabase.from("user_profiles").update({ status }).eq("user_id", userId)

    if (error) throw error
    return true
  } catch (error) {
    console.error("[v0] RBAC: Error updating user status:", error)
    return false
  }
}

export function hasPermission(userRole: UserRole, requiredPermission: string): boolean {
  const rolePermissions = {
    admin: ["*"], // Admin has all permissions
    stock_manager: [
      "dashboard.view",
      "inventory.view",
      "inventory.create",
      "inventory.edit",
      "purchases.view",
      "purchases.create",
      "purchases.edit",
      "suppliers.view",
      "suppliers.create",
      "suppliers.edit",
      "reports.view",
    ],
    commercial: [
      "dashboard.view",
      "sales.view",
      "sales.create",
      "sales.edit",
      "clients.view",
      "clients.create",
      "clients.edit",
      "reports.view",
    ],
    finance: [
      "dashboard.view",
      "expenses.view",
      "expenses.create",
      "expenses.edit",
      "reports.view",
      "sales.view",
      "purchases.view",
    ],
    visitor: ["dashboard.view"],
    seller: ["dashboard.view", "sales.view", "sales.create", "clients.view", "clients.create"],
  }

  const permissions = rolePermissions[userRole] || []
  return permissions.includes("*") || permissions.includes(requiredPermission)
}

export async function getPendingUsers(): Promise<
  Array<{
    id: string
    email: string
    created_at: string
  }>
> {
  if (typeof window === "undefined") return []

  try {
    const response = await fetch("/api/admin/pending-users")

    if (!response.ok) {
      console.error("[v0] Error fetching pending users:", response.statusText)
      return []
    }

    const data = await response.json()
    return data.pendingUsers || []
  } catch (error) {
    console.error("[v0] Error getting pending users:", error)
    return []
  }
}

export async function activateUser(userId: string, email: string, fullName: string, role: UserRole): Promise<boolean> {
  if (typeof window === "undefined") return false

  try {
    const response = await fetch("/api/admin/activate-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        email,
        fullName,
        role,
      }),
    })

    if (!response.ok) {
      console.error("[v0] Error activating user:", response.statusText)
      return false
    }

    return true
  } catch (error) {
    console.error("[v0] Error activating user:", error)
    return false
  }
}

export async function logAudit(
  action: string,
  tableName?: string,
  recordId?: string,
  oldValues?: any,
  newValues?: any,
) {
  if (typeof window === "undefined") return

  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const userAgent = navigator.userAgent

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action,
      table_name: tableName,
      record_id: recordId,
      old_values: oldValues,
      new_values: newValues,
      user_agent: userAgent,
    })
  } catch (error) {
    console.error("Error logging audit:", error)
  }
}
