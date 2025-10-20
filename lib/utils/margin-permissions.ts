import type { UserRole } from "@/lib/auth/rbac"

export function canViewMargins(userRole: UserRole): boolean {
  return ["admin", "stock_manager", "finance"].includes(userRole)
}

export function canViewPriceSuggestions(userRole: UserRole): boolean {
  return ["admin", "stock_manager"].includes(userRole)
}
