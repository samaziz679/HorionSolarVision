"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { getCurrentUserProfileClient, ROLE_PERMISSIONS } from "@/lib/auth/rbac-client"
import rolePermissions from "@/lib/auth/role-permissions.json"

interface DebugInfo {
  authUser: any
  userRole: any
  userProfile: any
  permissions: any
  navigationItems: any[]
  errors: string[]
  rolePermissionsConfig: any
}

export default function DebugRBACPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const runDiagnostics = async () => {
    setLoading(true)
    const errors: string[] = []

    try {
      console.log("[v0] Starting RBAC diagnostics...")

      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        errors.push(`Auth error: ${authError.message}`)
        console.error("[v0] Auth error:", authError)
      }
      console.log("[v0] Auth user:", authUser)

      let userRole = null
      if (authUser) {
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", authUser.id)
          .single()

        if (roleError) {
          errors.push(`Role error: ${roleError.message}`)
          console.error("[v0] Role error:", roleError)
        } else {
          userRole = roleData
          console.log("[v0] User role:", userRole)
        }
      }

      let userProfile = null
      if (authUser) {
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", authUser.id)
          .single()

        if (profileError) {
          errors.push(`Profile error: ${profileError.message}`)
          console.error("[v0] Profile error:", profileError)
        } else {
          userProfile = profileData
          console.log("[v0] User profile:", userProfile)
        }
      }

      const clientProfile = await getCurrentUserProfileClient()
      console.log("[v0] Client profile from rbac-client:", clientProfile)

      const permissions = userRole?.role ? ROLE_PERMISSIONS[userRole.role as keyof typeof ROLE_PERMISSIONS] : null
      console.log("[v0] Permissions for role:", permissions)

      const navigationItems = [
        { href: "/dashboard", label: "Tableau de bord", module: "dashboard" },
        { href: "/inventory", label: "Inventaire", module: "inventory" },
        { href: "/sales", label: "Ventes", module: "sales" },
        { href: "/purchases", label: "Achats", module: "purchases" },
        { href: "/clients", label: "Clients", module: "clients" },
        { href: "/suppliers", label: "Fournisseurs", module: "suppliers" },
        { href: "/expenses", label: "Dépenses", module: "expenses" },
        { href: "/reports", label: "Rapports", module: "reports" },
        { href: "/solar-sizer", label: "Dimensionnement Solaire", module: "solar-sizer" },
        { href: "/dashboard/voice-sales", label: "Assistant Vocal", module: "voice_assistant" },
        { href: "/admin/users", label: "Gestion Utilisateurs", module: "admin" },
        { href: "/settings", label: "Paramètres", module: "settings" },
      ]

      setDebugInfo({
        authUser,
        userRole,
        userProfile,
        permissions,
        navigationItems,
        errors,
        rolePermissionsConfig: rolePermissions,
      })

      console.log("[v0] RBAC diagnostics completed")
    } catch (error) {
      console.error("[v0] Diagnostics error:", error)
      errors.push(`Unexpected error: ${error}`)
      setDebugInfo({
        authUser: null,
        userRole: null,
        userProfile: null,
        permissions: null,
        navigationItems: [],
        errors,
        rolePermissionsConfig: rolePermissions,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">RBAC Debug Dashboard</h1>
        <Button onClick={runDiagnostics} disabled={loading}>
          {loading ? "Running..." : "Refresh Diagnostics"}
        </Button>
      </div>

      {debugInfo && (
        <div className="grid gap-6">
          {/* Errors */}
          {debugInfo.errors.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Errors Found</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {debugInfo.errors.map((error, index) => (
                    <div key={index} className="text-red-600 font-mono text-sm">
                      {error}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current User */}
          <Card>
            <CardHeader>
              <CardTitle>Authenticated User</CardTitle>
            </CardHeader>
            <CardContent>
              {debugInfo.authUser ? (
                <div className="space-y-2">
                  <div>
                    <strong>User ID:</strong> {debugInfo.authUser.id}
                  </div>
                  <div>
                    <strong>Email:</strong> {debugInfo.authUser.email}
                  </div>
                  <div>
                    <strong>Created:</strong> {new Date(debugInfo.authUser.created_at).toLocaleString()}
                  </div>
                  <details className="mt-4">
                    <summary className="cursor-pointer font-semibold">Full Auth User Object</summary>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                      {JSON.stringify(debugInfo.authUser, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <div className="text-red-600">No authenticated user found</div>
              )}
            </CardContent>
          </Card>

          {/* User Role */}
          <Card>
            <CardHeader>
              <CardTitle>User Role (from user_roles table)</CardTitle>
            </CardHeader>
            <CardContent>
              {debugInfo.userRole ? (
                <div className="space-y-2">
                  <div>
                    <strong>Role:</strong>{" "}
                    <Badge variant="outline" className="ml-2">
                      {debugInfo.userRole.role}
                    </Badge>
                  </div>
                  <div>
                    <strong>User ID:</strong> {debugInfo.userRole.user_id}
                  </div>
                  <div>
                    <strong>Created:</strong> {new Date(debugInfo.userRole.created_at).toLocaleString()}
                  </div>
                  <details className="mt-4">
                    <summary className="cursor-pointer font-semibold">Full Role Object</summary>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                      {JSON.stringify(debugInfo.userRole, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <div className="text-red-600">No role found in user_roles table</div>
              )}
            </CardContent>
          </Card>

          {/* User Profile */}
          <Card>
            <CardHeader>
              <CardTitle>User Profile (from user_profiles table)</CardTitle>
            </CardHeader>
            <CardContent>
              {debugInfo.userProfile ? (
                <div className="space-y-2">
                  <div>
                    <strong>Full Name:</strong> {debugInfo.userProfile.full_name || "Not set"}
                  </div>
                  <div>
                    <strong>Email:</strong> {debugInfo.userProfile.email}
                  </div>
                  <div>
                    <strong>Phone:</strong> {debugInfo.userProfile.phone || "Not set"}
                  </div>
                  <div>
                    <strong>Status:</strong>{" "}
                    <Badge variant="outline" className="ml-2">
                      {debugInfo.userProfile.status}
                    </Badge>
                  </div>
                  <details className="mt-4">
                    <summary className="cursor-pointer font-semibold">Full Profile Object</summary>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                      {JSON.stringify(debugInfo.userProfile, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <div className="text-yellow-600">No profile found in user_profiles table (optional)</div>
              )}
            </CardContent>
          </Card>

          {/* Role Permissions Config */}
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(debugInfo.rolePermissionsConfig).map(([role, config]: [string, any]) => (
                  <div key={role} className="border rounded p-3">
                    <div className="font-semibold mb-2 capitalize">{role}</div>
                    <div className="text-sm">
                      <strong>Modules:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {config.modules.map((module: string) => (
                          <Badge
                            key={module}
                            variant={module === "voice_assistant" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {module}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Current User Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              {debugInfo.permissions ? (
                <div className="space-y-2">
                  <div>
                    <strong>Accessible Modules:</strong>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {debugInfo.permissions.modules.map((module: string) => (
                        <Badge key={module} variant={module === "voice_assistant" ? "default" : "secondary"}>
                          {module}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-red-600">No permissions found (user has no role)</div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Items */}
          <Card>
            <CardHeader>
              <CardTitle>Navigation Items Visibility Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {debugInfo.navigationItems.map((item, index) => {
                  const shouldBeVisible = debugInfo.permissions?.modules.includes(item.module)

                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 border rounded ${
                        item.module === "voice_assistant" ? "border-blue-500 bg-blue-50" : ""
                      }`}
                    >
                      <div>
                        <strong>{item.label}</strong>
                        <div className="text-sm text-muted-foreground">
                          Module: <code className="bg-gray-100 px-1 rounded">{item.module}</code>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={shouldBeVisible ? "default" : "secondary"}>
                          {shouldBeVisible ? "✅ VISIBLE" : "❌ HIDDEN"}
                        </Badge>
                        {item.module === "voice_assistant" && <Badge variant="destructive">VOICE ASSISTANT</Badge>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
