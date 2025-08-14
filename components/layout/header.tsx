"use client"

import Link from "next/link"
import Image from "next/image"
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
import { useCompany } from "@/components/providers/company-provider"

export function Header() {
  const pathname = usePathname()
  const pageTitle = pathname.split("/").pop()?.replace("-", " ") || "tableau de bord"
  const company = useCompany()

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
    <header className="flex h-14 items-center gap-4 border-b gradient-solar px-4 lg:h-[60px] lg:px-6 shadow-lg">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Basculer le menu de navigation</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold mb-4">
              <div className="flex items-center gap-2">
                {company.logo ? (
                  <Image
                    src={company.logo || "/placeholder.svg"}
                    alt={`${company.name} Logo`}
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                      e.currentTarget.nextElementSibling?.classList.remove("hidden")
                    }}
                  />
                ) : null}
                <Package2 className={`h-6 w-6 text-solar-orange ${company.logo ? "hidden" : ""}`} />
              </div>
              <span className="text-solar-orange">{company.name}</span>
            </Link>
            {/* ... existing navigation links ... */}
            <Link
              href="/dashboard"
              className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground transition-colors ${
                pathname === "/dashboard"
                  ? "bg-solar-orange/10 text-solar-orange border-l-4 border-solar-orange"
                  : "text-muted-foreground hover:text-solar-orange"
              }`}
            >
              <Home className="h-5 w-5" />
              Tableau de bord
            </Link>
            <Link
              href="/inventory"
              className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground transition-colors ${
                pathname === "/inventory"
                  ? "bg-solar-orange/10 text-solar-orange border-l-4 border-solar-orange"
                  : "text-muted-foreground hover:text-solar-orange"
              }`}
            >
              <Package className="h-5 w-5" />
              Inventaire
            </Link>
            <Link
              href="/sales"
              className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground transition-colors ${
                pathname === "/sales"
                  ? "bg-solar-orange/10 text-solar-orange border-l-4 border-solar-orange"
                  : "text-muted-foreground hover:text-solar-orange"
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              Ventes
            </Link>
            <Link
              href="/purchases"
              className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground transition-colors ${
                pathname === "/purchases"
                  ? "bg-solar-orange/10 text-solar-orange border-l-4 border-solar-orange"
                  : "text-muted-foreground hover:text-solar-orange"
              }`}
            >
              <Truck className="h-5 w-5" />
              Achats
            </Link>
            <Link
              href="/clients"
              className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground transition-colors ${
                pathname === "/clients"
                  ? "bg-solar-orange/10 text-solar-orange border-l-4 border-solar-orange"
                  : "text-muted-foreground hover:text-solar-orange"
              }`}
            >
              <Users className="h-5 w-5" />
              Clients
            </Link>
            <Link
              href="/suppliers"
              className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground transition-colors ${
                pathname === "/suppliers"
                  ? "bg-solar-orange/10 text-solar-orange border-l-4 border-solar-orange"
                  : "text-muted-foreground hover:text-solar-orange"
              }`}
            >
              <Users className="h-5 w-5" />
              Fournisseurs
            </Link>
            <Link
              href="/expenses"
              className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground transition-colors ${
                pathname === "/expenses"
                  ? "bg-solar-orange/10 text-solar-orange border-l-4 border-solar-orange"
                  : "text-muted-foreground hover:text-solar-orange"
              }`}
            >
              <DollarSign className="h-5 w-5" />
              Dépenses
            </Link>
            <Link
              href="/reports"
              className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground transition-colors ${
                pathname === "/reports"
                  ? "bg-solar-orange/10 text-solar-orange border-l-4 border-solar-orange"
                  : "text-muted-foreground hover:text-solar-orange"
              }`}
            >
              <LineChart className="h-5 w-5" />
              Rapports
            </Link>
          </nav>
        </SheetContent>
      </Sheet>

      <Link href="/dashboard" className="flex items-center gap-2 text-white hover:text-white/90 transition-colors">
        <div className="flex items-center gap-2">
          {company.logo ? (
            <Image
              src={company.logo || "/placeholder.svg"}
              alt={`${company.name} Logo`}
              width={32}
              height={32}
              className="h-8 w-8 object-contain bg-white/10 rounded p-1"
              onError={(e) => {
                e.currentTarget.style.display = "none"
                e.currentTarget.nextElementSibling?.classList.remove("hidden")
              }}
            />
          ) : null}
          <Package2 className={`h-6 w-6 text-white ${company.logo ? "hidden" : ""}`} />
        </div>
        <span className="font-semibold text-lg hidden sm:block">{company.name}</span>
      </Link>

      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard" className="text-white/90 hover:text-white transition-colors">
                Tableau de bord
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-white/70" />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-white font-medium">{getPageTitleInFrench(pageTitle)}</BreadcrumbPage>
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
