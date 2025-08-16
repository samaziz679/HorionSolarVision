import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createClient } from "@/lib/supabase/client"

export type UserRole = "admin" | "manager" | "vendeur"
export type UserStatus = "active" | "suspended" | "pending"

export interface UserProfile {
  id: string
  user_id: string
  email: string
  full_name: string | null
  role: UserRole
  status: UserStatus
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  user_id: string
  action: string
  table_name: string | null
  record_id: string | null
  old_values: any
  new_values: any
  created_at: string
}

// Role permissions configuration
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
    actions: ["create", "read", "update", "delete", "manage_users"],
  },
  manager: {
    modules: ["dashboard", "inventory", "sales", "purchases", "clients", "suppliers", "expenses", "reports"],
    actions: ["create", "read", "update", "delete"],
  },
  vendeur: {
    modules: ["dashboard", "sales", "clients"],
    actions: ["create", "read"], // Can only create new sales, not modify existing
  },
} as const

// Server-side functions
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from("user_roles").select("*").eq("user_id", user.id).single()

  return profile
}

export async function hasPermission(userRole: UserRole, module: string, action?: string): Promise<boolean> {
  const permissions = ROLE_PERMISSIONS[userRole]

  const hasModuleAccess = permissions.modules.includes(module as any)
  if (!action) return hasModuleAccess

  const hasActionAccess = permissions.actions.includes(action as any)
  return hasModuleAccess && hasActionAccess
}

export async function requireRole(allowedRoles: UserRole[]): Promise<UserProfile> {
  const profile = await getCurrentUserProfile()

  if (!profile) {
    throw new Error("User not authenticated")
  }

  if (profile.status !== "active") {
    throw new Error("User account is not active")
  }

  if (!allowedRoles.includes(profile.role)) {
    throw new Error("Insufficient permissions")
  }

  return profile
}

// Client-side functions
export async function getCurrentUserProfileClient(): Promise<UserProfile | null> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from("user_roles").select("*").eq("user_id", user.id).single()

  return profile
}

export async function logAudit(
  action: string,
  tableName?: string,
  recordId?: string,
  oldValues?: any,
  newValues?: any,
) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action,
    table_name: tableName,
    record_id: recordId,
    old_values: oldValues,
    new_values: newValues,
  })
}
