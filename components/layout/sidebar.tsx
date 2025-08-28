"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Home, LineChart, Package, Package2, ShoppingCart, Users, DollarSign, Truck, Settings } from "lucide-react"
import { usePathname } from "next/navigation"
import UserButton from "@/components/auth/user-button"
import { getCurrentUserProfileClient, ROLE_PERMISSIONS, type UserRole } from "@/lib/auth/rbac-client"
import { useCompany } from "@/components/providers/company-provider"

interface NavigationItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  module: string
}

const ALL_NAVIGATION_ITEMS: NavigationItem[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: Home, module: "dashboard" },
  { href: "/inventory", label: "Inventaire", icon: Package, module: "inventory" },
  { href: "/sales", label: "Ventes", icon: ShoppingCart, module: "sales" },
  { href: "/purchases", label: "Achats", icon: Truck, module: "purchases" },
  { href: "/clients", label: "Clients", icon: Users, module: "clients" },
  { href: "/suppliers", label: "Fournisseurs", icon: Users, module: "suppliers" },
  { href: "/expenses", label: "Dépenses", icon: DollarSign, module: "expenses" },
  { href: "/reports", label: "Rapports", icon: LineChart, module: "reports" },
  { href: "/admin/users", label: "Gestion Utilisateurs", icon: Users, module: "admin" },
  { href: "/settings", label: "Paramètres", icon: Settings, module: "settings" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>(ALL_NAVIGATION_ITEMS)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const company = useCompany()

  useEffect(() => {
    async function loadUserRole() {
      try {
        const profile = await getCurrentUserProfileClient()
        if (profile && profile.status === "active") {
          setUserRole(profile.role)
          const permissions = ROLE_PERMISSIONS[profile.role]
          const filteredItems = ALL_NAVIGATION_ITEMS.filter((item) => permissions.modules.includes(item.module as any))
          setNavigationItems(filteredItems)
        }
      } catch (error) {
        console.error("Error loading user role:", error)
        const basicItems = ALL_NAVIGATION_ITEMS.filter((item) =>
          ["dashboard", "sales", "clients"].includes(item.module),
        )
        setNavigationItems(basicItems)
      } finally {
        setLoading(false)
      }
    }

    loadUserRole()
  }, [])

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <div className="flex items-center gap-2">
              {company.logo ? (
                <Image
                  src={company.logo || "/placeholder.svg"}
                  alt={`${company.name} Logo`}
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                    e.currentTarget.nextElementSibling?.classList.remove("hidden")
                  }}
                />
              ) : null}
              <Package2 className={`h-6 w-6 ${company.logo ? "hidden" : ""}`} />
            </div>
            <span className="">{company.name}</span>
          </Link>
          <UserButton />
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {userRole && !loading && (
              <div className="px-3 py-2 text-xs text-muted-foreground border-b mb-2">
                Rôle: <span className="font-medium capitalize">{userRole}</span>
              </div>
            )}
            {navigationItems.map((item) => {
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
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
