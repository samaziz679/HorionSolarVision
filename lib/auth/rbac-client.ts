import { createClient } from "@/lib/supabase/client"
import rolePermissions from "./role-permissions.json"

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

type ClientRolePermissionConfig = {
  modules: readonly string[]
}

const rolePermissionsRecord = rolePermissions as Record<
  UserRole,
  {
    modules: readonly string[]
    actions?: readonly string[]
  }
>

export const ROLE_PERMISSIONS: Record<UserRole, ClientRolePermissionConfig> = Object.fromEntries(
  Object.entries(rolePermissionsRecord).map(([role, config]) => [role, { modules: config.modules }]),
) as Record<UserRole, ClientRolePermissionConfig>

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  if (typeof window === "undefined") {
    console.log("[v0] RBAC: Running on server, returning null")
    return null
  }

  try {
    const supabase = createClient()

    console.log("[v0] RBAC: Getting authenticated user...")
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("[v0] RBAC: Error getting user:", userError)
      return null
    }

    if (!user) {
      console.log("[v0] RBAC: No authenticated user found")
      return null
    }

    console.log("[v0] RBAC: Authenticated user ID:", user.id)
    console.log("[v0] RBAC: User email:", user.email)

    console.log("[v0] RBAC: Querying user_roles table...")
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("id, user_id, role, created_by, created_at")
      .eq("user_id", user.id)
      .single()

    if (roleError) {
      console.error("[v0] RBAC: Error querying user_roles:", roleError)
      return null
    }

    if (!userRole) {
      console.log("[v0] RBAC: No role found for user in user_roles table")
      return null
    }

    console.log("[v0] RBAC: User role found:", userRole.role)

    console.log("[v0] RBAC: Querying user_profiles table...")
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
      status: (userProfile?.status as UserStatus) || "active",
      created_at: userRole.created_at,
      created_by: userRole.created_by,
      email: userProfile?.email || user.email || "",
      full_name: userProfile?.full_name || "",
    }

    console.log("[v0] RBAC: Final profile constructed:", {
      role: profile.role,
      status: profile.status,
      email: profile.email,
      full_name: profile.full_name,
    })

    const permissions = ROLE_PERMISSIONS[profile.role]
    console.log("[v0] RBAC: Role permissions:", permissions)
    console.log("[v0] RBAC: Available modules:", permissions.modules)
    console.log("[v0] RBAC: Has voice_assistant?", permissions.modules.includes("voice_assistant"))

    return profile
  } catch (error) {
    console.error("[v0] RBAC: Unexpected error in getCurrentUserProfile:", error)
    if (error instanceof Error) {
      console.error("[v0] RBAC: Error message:", error.message)
      console.error("[v0] RBAC: Error stack:", error.stack)
    }
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
      "voice_assistant.view",
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
      "voice_assistant.view",
    ],
    finance: [
      "dashboard.view",
      "expenses.view",
      "expenses.create",
      "expenses.edit",
      "reports.view",
      "sales.view",
      "purchases.view",
      "voice_assistant.view",
    ],
    visitor: ["dashboard.view", "voice_assistant.view"],
    seller: ["dashboard.view", "sales.view", "sales.create", "clients.view", "clients.create", "voice_assistant.view"],
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
