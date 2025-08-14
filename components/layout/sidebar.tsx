"use client"

import Link from "next/link"
import { Home, LineChart, Package, Package2, ShoppingCart, Users, DollarSign, Truck, Settings } from "lucide-react"
import { usePathname } from "next/navigation"
import UserButton from "@/components/auth/user-button"

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
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                pathname === "/dashboard" ? "bg-muted text-primary" : "text-muted-foreground"
              }`}
            >
              <Home className="h-4 w-4" />
              Tableau de bord
            </Link>
            <Link
              href="/inventory"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                pathname === "/inventory" ? "bg-muted text-primary" : "text-muted-foreground"
              }`}
            >
              <Package className="h-4 w-4" />
              Inventaire
            </Link>
            <Link
              href="/sales"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                pathname === "/sales" ? "bg-muted text-primary" : "text-muted-foreground"
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              Ventes
            </Link>
            <Link
              href="/purchases"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                pathname === "/purchases" ? "bg-muted text-primary" : "text-muted-foreground"
              }`}
            >
              <Truck className="h-4 w-4" />
              Achats
            </Link>
            <Link
              href="/clients"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                pathname === "/clients" ? "bg-muted text-primary" : "text-muted-foreground"
              }`}
            >
              <Users className="h-4 w-4" />
              Clients
            </Link>
            <Link
              href="/suppliers"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                pathname === "/suppliers" ? "bg-muted text-primary" : "text-muted-foreground"
              }`}
            >
              <Users className="h-4 w-4" />
              Fournisseurs
            </Link>
            <Link
              href="/expenses"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                pathname === "/expenses" ? "bg-muted text-primary" : "text-muted-foreground"
              }`}
            >
              <DollarSign className="h-4 w-4" />
              Dépenses
            </Link>
            <Link
              href="/reports"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                pathname === "/reports" ? "bg-muted text-primary" : "text-muted-foreground"
              }`}
            >
              <LineChart className="h-4 w-4" />
              Rapports
            </Link>
            <Link
              href="/settings"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                pathname === "/settings" ? "bg-muted text-primary" : "text-muted-foreground"
              }`}
            >
              <Settings className="h-4 w-4" />
              Paramètres
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
