"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers/auth-provider"
import { useCompany } from "@/components/providers/company-provider"

interface DebugInfo {
  currentUser: any
  userProfile: any
  companySettings: any
  permissions: any
  navigationItems: any[]
  errors: string[]
}

export default function DebugRBACPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const { user, profile } = useAuth()
  const { settings } = useCompany()
  const supabase = createClient()

  const runDiagnostics = async () => {
    setLoading(true)
    const errors: string[] = []

    try {
      console.log("[v0] Starting RBAC diagnostics...")

      // Get current user from auth
      const { data: authUser, error: authError } = await supabase.auth.getUser()
      if (authError) errors.push(`Auth error: ${authError.message}`)

      // Get user profile
      const { data: userProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", authUser?.user?.id)
        .single()

      if (profileError) errors.push(`Profile error: ${profileError.message}`)

      // Get company settings
      const { data: companySettings, error: companyError } = await supabase
        .from("company_settings")
        .select("*")
        .single()

      if (companyError) errors.push(`Company settings error: ${companyError.message}`)

      // Test permissions
      const permissions = {
        canAccessSales: false,
        canAccessInventory: false,
        canAccessAdmin: false,
      }

      if (userProfile?.role) {
        const rolePermissions = {
          admin: [
            "dashboard",
            "inventory",
            "sales",
            "purchases",
            "clients",
            "suppliers",
            "expenses",
            "reports",
            "solar_sizing",
            "user_management",
            "settings",
          ],
          commercial: ["dashboard", "inventory", "sales", "clients", "suppliers", "reports", "solar_sizing"],
          seller: ["dashboard", "sales", "clients", "reports"],
          inventory_manager: ["dashboard", "inventory", "purchases", "suppliers", "reports"],
          accountant: ["dashboard", "expenses", "reports", "clients", "suppliers"],
        }

        const userPermissions = rolePermissions[userProfile.role as keyof typeof rolePermissions] || []
        permissions.canAccessSales = userPermissions.includes("sales")
        permissions.canAccessInventory = userPermissions.includes("inventory")
        permissions.canAccessAdmin = userPermissions.includes("user_management")
      }

      // Navigation items that should be visible
      const navigationItems = [
        { href: "/dashboard", label: "Tableau de bord", module: "dashboard" },
        { href: "/inventory", label: "Inventaire", module: "inventory" },
        { href: "/sales", label: "Ventes", module: "sales" },
        { href: "/dashboard/voice-sales", label: "Assistant Vocal", module: "voice_assistant" },
        { href: "/purchases", label: "Achats", module: "purchases" },
        { href: "/clients", label: "Clients", module: "clients" },
        { href: "/suppliers", label: "Fournisseurs", module: "suppliers" },
        { href: "/expenses", label: "Dépenses", module: "expenses" },
        { href: "/reports", label: "Rapports", module: "reports" },
        { href: "/solar-sizing", label: "Dimensionnement Solaire", module: "solar_sizing" },
        { href: "/user-management", label: "Gestion Utilisateurs", module: "user_management" },
        { href: "/settings", label: "Paramètres", module: "settings" },
      ]

      setDebugInfo({
        currentUser: authUser?.user,
        userProfile,
        companySettings,
        permissions,
        navigationItems,
        errors,
      })

      console.log("[v0] RBAC diagnostics completed:", {
        authUser: authUser?.user,
        userProfile,
        companySettings,
        permissions,
        errors,
      })
    } catch (error) {
      console.error("[v0] Diagnostics error:", error)
      errors.push(`Unexpected error: ${error}`)
      setDebugInfo({
        currentUser: null,
        userProfile: null,
        companySettings: null,
        permissions: null,
        navigationItems: [],
        errors,
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
              <CardTitle>Current User (from Auth Provider)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Auth Provider User:</strong>
                  <pre className="text-sm bg-gray-100 p-2 rounded mt-1">{JSON.stringify(user, null, 2)}</pre>
                </div>
                <div>
                  <strong>Auth Provider Profile:</strong>
                  <pre className="text-sm bg-gray-100 p-2 rounded mt-1">{JSON.stringify(profile, null, 2)}</pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database User */}
          <Card>
            <CardHeader>
              <CardTitle>Database User Profile</CardTitle>
            </CardHeader>
            <CardContent>
              {debugInfo.userProfile ? (
                <div className="space-y-2">
                  <div>
                    <strong>ID:</strong> {debugInfo.userProfile.id}
                  </div>
                  <div>
                    <strong>Email:</strong> {debugInfo.userProfile.email}
                  </div>
                  <div>
                    <strong>Name:</strong> {debugInfo.userProfile.first_name} {debugInfo.userProfile.last_name}
                  </div>
                  <div>
                    <strong>Role:</strong> <Badge variant="outline">{debugInfo.userProfile.role}</Badge>
                  </div>
                  <div>
                    <strong>Active:</strong> {debugInfo.userProfile.is_active ? "✅" : "❌"}
                  </div>
                  <div>
                    <strong>Created:</strong> {new Date(debugInfo.userProfile.created_at).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="text-red-600">No user profile found in database</div>
              )}
            </CardContent>
          </Card>

          {/* Company Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Company Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>From Company Provider:</strong>
                  <pre className="text-sm bg-gray-100 p-2 rounded mt-1">{JSON.stringify(settings, null, 2)}</pre>
                </div>
                <div>
                  <strong>From Database:</strong>
                  <pre className="text-sm bg-gray-100 p-2 rounded mt-1">
                    {JSON.stringify(debugInfo.companySettings, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Calculated Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              {debugInfo.permissions && (
                <div className="space-y-2">
                  <div>
                    <strong>Can Access Sales:</strong> {debugInfo.permissions.canAccessSales ? "✅" : "❌"}
                  </div>
                  <div>
                    <strong>Can Access Inventory:</strong> {debugInfo.permissions.canAccessInventory ? "✅" : "❌"}
                  </div>
                  <div>
                    <strong>Can Access Admin:</strong> {debugInfo.permissions.canAccessAdmin ? "✅" : "❌"}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Items */}
          <Card>
            <CardHeader>
              <CardTitle>Navigation Items Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {debugInfo.navigationItems.map((item, index) => {
                  const shouldBeVisible =
                    debugInfo.userProfile?.role &&
                    (["admin"].includes(debugInfo.userProfile.role) ||
                      (item.module === "sales" && ["commercial", "seller"].includes(debugInfo.userProfile.role)) ||
                      item.module === "dashboard")

                  return (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <strong>{item.label}</strong> ({item.module})
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={shouldBeVisible ? "default" : "secondary"}>
                          {shouldBeVisible ? "Should Show" : "Should Hide"}
                        </Badge>
                        {item.label === "Assistant Vocal" && <Badge variant="destructive">VOICE ASSISTANT</Badge>}
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
