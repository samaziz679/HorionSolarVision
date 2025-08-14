"use client"

import type React from "react"

import Link from "next/link"
import {
  Home,
  LineChart,
  Package,
  Package2,
  ShoppingCart,
  Users,
  DollarSign,
  Truck,
  Settings,
  Shield,
} from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import UserButton from "@/components/auth/user-button"
import { getCurrentUserProfileClient, type UserRole, ROLE_PERMISSIONS } from "@/lib/auth/rbac-client"

interface NavigationItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  module: string
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: Home, module: "dashboard" },
  { href: "/inventory", label: "Inventaire", icon: Package, module: "inventory" },
  { href: "/sales", label: "Ventes", icon: ShoppingCart, module: "sales" },
  { href: "/purchases", label: "Achats", icon: Truck, module: "purchases" },
  { href: "/clients", label: "Clients", icon: Users, module: "clients" },
  { href: "/suppliers", label: "Fournisseurs", icon: Users, module: "suppliers" },
  { href: "/expenses", label: "Dépenses", icon: DollarSign, module: "expenses" },
  { href: "/reports", label: "Rapports", icon: LineChart, module: "reports" },
  { href: "/settings", label: "Paramètres", icon: Settings, module: "settings" },
  { href: "/admin/users", label: "Gestion Utilisateurs", icon: Shield, module: "admin" },
]

const DEFAULT_NAVIGATION_ITEMS = NAVIGATION_ITEMS.filter((item) =>
  ["dashboard", "sales", "clients"].includes(item.module),
)

export function Sidebar() {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [allowedItems, setAllowedItems] = useState<NavigationItem[]>(DEFAULT_NAVIGATION_ITEMS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadUserRole() {
      try {
        console.log("Sidebar Debug: Starting to load user role...")
        const profile = await getCurrentUserProfileClient()
        console.log("Sidebar Debug: Received user profile:", profile)

        if (!profile) {
          console.log("Sidebar Debug: No profile found, using default navigation")
          setAllowedItems(DEFAULT_NAVIGATION_ITEMS)
          setIsLoading(false)
          return
        }

        console.log("Sidebar Debug: Profile status:", profile.status)
        console.log("Sidebar Debug: Profile role:", profile.role)

        if (profile.status === "active") {
          setUserRole(profile.role)
          console.log("Sidebar Debug: User role set to:", profile.role)

          // Filter navigation items based on user role
          const permissions = ROLE_PERMISSIONS[profile.role]
          console.log("Sidebar Debug: Role permissions:", permissions)

          const filtered = NAVIGATION_ITEMS.filter((item) => permissions.modules.includes(item.module as any))
          console.log(
            "Sidebar Debug: Filtered navigation items:",
            filtered.map((item) => item.label),
          )
          setAllowedItems(filtered)
        } else {
          console.log("Sidebar Debug: User not active (status:", profile.status, "), using default navigation")
          setAllowedItems(DEFAULT_NAVIGATION_ITEMS)
        }
      } catch (error) {
        console.error("Sidebar Debug: Error loading user role:", error)
        setAllowedItems(DEFAULT_NAVIGATION_ITEMS)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserRole()
  }, [])

  if (isLoading) {
    return (
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="">Solar Vision ERP</span>
            </Link>
            <UserButton />
          </div>
          <div className="flex-1 p-4">
            <div className="text-sm text-muted-foreground">Chargement...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6" />
            <span className="">Solar Vision ERP</span>
          </Link>
          <UserButton />
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {allowedItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                    pathname === item.href ? "bg-muted text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {item.module === "admin" && userRole === "admin" && (
                    <span className="ml-auto text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Admin</span>
                  )}
                </Link>
              )
            })}
          </nav>
          {userRole && (
            <div className="mt-auto p-4 border-t">
              <div className="text-xs text-muted-foreground">Rôle: {userRole}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Sidebar
