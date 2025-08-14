"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUserProfileClient, type UserRole, ROLE_PERMISSIONS } from "@/lib/auth/rbac"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  requiredModule?: string
  requiredAction?: string
  fallback?: React.ReactNode
  redirectTo?: string
}

export function RoleGuard({
  children,
  allowedRoles,
  requiredModule,
  requiredAction,
  fallback,
  redirectTo = "/dashboard",
}: RoleGuardProps) {
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function checkAccess() {
      try {
        const profile = await getCurrentUserProfileClient()

        if (!profile) {
          router.push("/login")
          return
        }

        if (profile.status !== "active") {
          setHasAccess(false)
          setLoading(false)
          return
        }

        setUserRole(profile.role)

        // Check role-based access
        if (allowedRoles && !allowedRoles.includes(profile.role)) {
          setHasAccess(false)
          setLoading(false)
          return
        }

        // Check module and action permissions
        if (requiredModule) {
          const permissions = ROLE_PERMISSIONS[profile.role]
          const hasModuleAccess = permissions.modules.includes(requiredModule as any)

          if (!hasModuleAccess) {
            setHasAccess(false)
            setLoading(false)
            return
          }

          if (requiredAction) {
            const hasActionAccess = permissions.actions.includes(requiredAction as any)
            if (!hasActionAccess) {
              setHasAccess(false)
              setLoading(false)
              return
            }
          }
        }

        setHasAccess(true)
      } catch (error) {
        console.error("Error checking access:", error)
        setHasAccess(false)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [allowedRoles, requiredModule, requiredAction, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Vérification des permissions...</span>
      </div>
    )
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Vous n'avez pas les permissions nécessaires pour accéder à cette section.
            {userRole && (
              <span className="block mt-2 text-sm">
                Votre rôle actuel: <strong>{userRole}</strong>
              </span>
            )}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return <>{children}</>
}
