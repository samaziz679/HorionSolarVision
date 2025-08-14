"use client"

import type React from "react"

import Link from "next/link"
import { Home, LineChart, Package, Package2, ShoppingCart, Users, DollarSign, Truck, Settings } from "lucide-react"
import { usePathname } from "next/navigation"
import UserButton from "@/components/auth/user-button"

interface NavigationItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: Home },
  { href: "/inventory", label: "Inventaire", icon: Package },
  { href: "/sales", label: "Ventes", icon: ShoppingCart },
  { href: "/purchases", label: "Achats", icon: Truck },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/suppliers", label: "Fournisseurs", icon: Users },
  { href: "/expenses", label: "Dépenses", icon: DollarSign },
  { href: "/reports", label: "Rapports", icon: LineChart },
  { href: "/settings", label: "Paramètres", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

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
            {NAVIGATION_ITEMS.map((item) => {
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
