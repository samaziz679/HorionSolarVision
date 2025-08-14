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

export function Sidebar() {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [allowedItems, setAllowedItems] = useState<NavigationItem[]>([])

  useEffect(() => {
    async function loadUserRole() {
      try {
        const profile = await getCurrentUserProfileClient()
        if (profile && profile.status === "active") {
          setUserRole(profile.role)

          // Filter navigation items based on user role
          const permissions = ROLE_PERMISSIONS[profile.role]
          const filtered = NAVIGATION_ITEMS.filter((item) => permissions.modules.includes(item.module as any))
          setAllowedItems(filtered)
        }
      } catch (error) {
        console.error("Error loading user role:", error)
        // Fallback to basic navigation for vendeur
        setAllowedItems(NAVIGATION_ITEMS.filter((item) => ["dashboard", "sales", "clients"].includes(item.module)))
      }
    }

    loadUserRole()
  }, [])

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
              <div className="text-xs text-muted-foreground">
                Rôle: <span className="font-medium capitalize">{userRole}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Sidebar
