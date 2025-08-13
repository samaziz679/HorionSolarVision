"use client"

import Link from "next/link"
import { Home, LineChart, Package, Package2, PanelLeft, ShoppingCart, Users, DollarSign, Truck } from "lucide-react"
import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import UserButton from "@/components/auth/user-button"

export function Header() {
  const pathname = usePathname()
  const pageTitle = pathname.split("/").pop()?.replace("-", " ") || "tableau de bord"

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  const getPageTitleInFrench = (title: string) => {
    const translations: { [key: string]: string } = {
      dashboard: "Tableau de bord",
      inventory: "Inventaire",
      sales: "Ventes",
      purchases: "Achats",
      clients: "Clients",
      suppliers: "Fournisseurs",
      expenses: "Dépenses",
      reports: "Rapports",
    }
    return translations[title] || capitalize(title)
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden bg-transparent">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Basculer le menu de navigation</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Package2 className="h-6 w-6" />
              <span className="sr-only">Solar Vision ERP</span>
            </Link>
            <Link
              href="/dashboard"
              className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground ${
                pathname === "/dashboard" ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
            >
              <Home className="h-5 w-5" />
              Tableau de bord
            </Link>
            <Link
              href="/inventory"
              className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground ${
                pathname === "/inventory" ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
            >
              <Package className="h-5 w-5" />
              Inventaire
            </Link>
            <Link
              href="/sales"
              className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground ${
                pathname === "/sales" ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              Ventes
            </Link>
            <Link
              href="/purchases"
              className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground ${
                pathname === "/purchases" ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
            >
              <Truck className="h-5 w-5" />
              Achats
            </Link>
            <Link
              href="/clients"
              className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground ${
                pathname === "/clients" ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
            >
              <Users className="h-5 w-5" />
              Clients
            </Link>
            <Link
              href="/suppliers"
              className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground ${
                pathname === "/suppliers" ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
            >
              <Users className="h-5 w-5" />
              Fournisseurs
            </Link>
            <Link
              href="/expenses"
              className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground ${
                pathname === "/expenses" ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
            >
              <DollarSign className="h-5 w-5" />
              Dépenses
            </Link>
            <Link
              href="/reports"
              className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground ${
                pathname === "/reports" ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
            >
              <LineChart className="h-5 w-5" />
              Rapports
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Tableau de bord</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{getPageTitleInFrench(pageTitle)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-2">
        <UserButton />
      </div>
    </header>
  )
}

export default Header
