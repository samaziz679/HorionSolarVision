"use client"

import Link from "next/link"
import { Home, LineChart, Package, Package2, PanelLeft, ShoppingCart, Users, DollarSign, Truck } from "lucide-react"
import { useTranslations } from "next-intl"
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
import { LanguageSwitcher } from "@/components/language-switcher"

export function Header() {
  const t = useTranslations()
  const pathname = usePathname()

  const locale = pathname.split("/")[1]
  const currentPath = pathname.replace(`/${locale}`, "")
  const pageTitle = currentPath.split("/").pop()?.replace("-", " ") || "dashboard"

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden bg-transparent">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <Link href={`/${locale}/dashboard`} className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Package2 className="h-6 w-6" />
              <span className="sr-only">Solar Vision ERP</span>
            </Link>
            <Link
              href={`/${locale}/dashboard`}
              className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground ${
                currentPath === "/dashboard" ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
            >
              <Home className="h-5 w-5" />
              {t("navigation.dashboard")}
            </Link>
            <Link
              href={`/${locale}/inventory`}
              className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground ${
                currentPath === "/inventory" ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
            >
              <Package className="h-5 w-5" />
              {t("navigation.inventory")}
            </Link>
            <Link
              href={`/${locale}/sales`}
              className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground ${
                currentPath === "/sales" ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              {t("navigation.sales")}
            </Link>
            <Link
              href={`/${locale}/purchases`}
              className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground ${
                currentPath === "/purchases" ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
            >
              <Truck className="h-5 w-5" />
              {t("navigation.purchases")}
            </Link>
            <Link
              href={`/${locale}/clients`}
              className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground ${
                currentPath === "/clients" ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
            >
              <Users className="h-5 w-5" />
              {t("navigation.clients")}
            </Link>
            <Link
              href={`/${locale}/suppliers`}
              className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground ${
                currentPath === "/suppliers" ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
            >
              <Users className="h-5 w-5" />
              {t("navigation.suppliers")}
            </Link>
            <Link
              href={`/${locale}/expenses`}
              className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground ${
                currentPath === "/expenses" ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
            >
              <DollarSign className="h-5 w-5" />
              {t("navigation.expenses")}
            </Link>
            <Link
              href={`/${locale}/reports`}
              className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground ${
                currentPath === "/reports" ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
            >
              <LineChart className="h-5 w-5" />
              {t("navigation.reports")}
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/${locale}/dashboard`}>{t("navigation.dashboard")}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{capitalize(pageTitle)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-2">
        <LanguageSwitcher />
        <UserButton />
      </div>
    </header>
  )
}

export default Header
