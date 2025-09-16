import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createClient } from "@/lib/supabase/client"
import { supabaseAdmin } from "@/lib/supabase/admin"

export type UserRole = "admin" | "stock_manager" | "commercial" | "finance" | "visitor" | "seller"
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
  stock_manager: {
    modules: ["dashboard", "inventory", "purchases", "suppliers", "reports"],
    actions: ["create", "read", "update", "delete"],
  },
  commercial: {
    modules: ["dashboard", "sales", "clients", "reports"],
    actions: ["create", "read", "update", "delete"],
  },
  finance: {
    modules: ["dashboard", "expenses", "reports", "sales", "purchases"],
    actions: ["create", "read", "update", "delete"],
  },
  visitor: {
    modules: ["dashboard"],
    actions: ["read"],
  },
  seller: {
    modules: ["dashboard", "sales", "clients"],
    actions: ["create", "read"],
  },
} as const

// Server-side functions
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // First get the user role
  const { data: roleData, error: roleError } = await supabase
    .from("user_roles")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (roleError) {
    console.error("[v0] Error fetching user role:", roleError)
    return null
  }

  // Then get the user profile
  const { data: profileData, error: profileError } = await supabase
    .from("user_profiles")
    .select("email, full_name, status")
    .eq("user_id", user.id)
    .single()

  if (profileError) {
    console.error("[v0] Error fetching user profile:", profileError)
    return null
  }

  if (!roleData || !profileData) return null

  return {
    id: roleData.id,
    user_id: roleData.user_id,
    email: profileData.email,
    full_name: profileData.full_name,
    role: roleData.role,
    status: profileData.status,
    created_at: roleData.created_at,
    updated_at: roleData.updated_at,
  }
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

export async function getPendingUsers(): Promise<
  Array<{
    id: string
    email: string
    created_at: string
  }>
> {
  const supabase = supabaseAdmin
  const regularSupabase = createSupabaseServerClient()

  // Get all authenticated users from auth.users
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

  if (authError) {
    console.error("[v0] Error fetching auth users:", authError)
    return []
  }

  // Get all users that have profiles using regular client
  const { data: profileUsers, error: profileError } = await regularSupabase.from("user_profiles").select("user_id")

  if (profileError) {
    console.error("[v0] Error fetching profile users:", profileError)
    return []
  }

  const profileUserIds = new Set(profileUsers?.map((p) => p.user_id) || [])

  // Find users in auth but not in profiles (pending users)
  const pendingUsers = authUsers.users
    .filter((user) => !profileUserIds.has(user.id))
    .map((user) => ({
      id: user.id,
      email: user.email || "",
      created_at: user.created_at,
    }))

  return pendingUsers
}

export async function activateUser(userId: string, email: string, fullName: string, role: UserRole): Promise<boolean> {
  const supabase = createSupabaseServerClient()

  try {
    // Create user profile
    const { error: profileError } = await supabase.from("user_profiles").insert({
      user_id: userId,
      email: email,
      full_name: fullName,
      status: "active",
    })

    if (profileError) {
      console.error("[v0] Error creating user profile:", profileError)
      return false
    }

    // Create user role
    const { error: roleError } = await supabase.from("user_roles").insert({
      user_id: userId,
      role: role,
    })

    if (roleError) {
      console.error("[v0] Error creating user role:", roleError)
      return false
    }

    return true
  } catch (error) {
    console.error("[v0] Error activating user:", error)
    return false
  }
}

// Client-side functions
export async function getCurrentUserProfileClient(): Promise<UserProfile | null> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // First get the user role
  const { data: roleData, error: roleError } = await supabase
    .from("user_roles")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (roleError) {
    console.error("[v0] Error fetching user role:", roleError)
    return null
  }

  // Then get the user profile
  const { data: profileData, error: profileError } = await supabase
    .from("user_profiles")
    .select("email, full_name, status")
    .eq("user_id", user.id)
    .single()

  if (profileError) {
    console.error("[v0] Error fetching user profile:", profileError)
    return null
  }

  if (!roleData || !profileData) return null

  return {
    id: roleData.id,
    user_id: roleData.user_id,
    email: profileData.email,
    full_name: profileData.full_name,
    role: roleData.role,
    status: profileData.status,
    created_at: roleData.created_at,
    updated_at: roleData.updated_at,
  }
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
