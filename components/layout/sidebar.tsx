"use client"

import Link from "next/link"
import { Home, LineChart, Package, Package2, ShoppingCart, Users, DollarSign, Truck } from "lucide-react"
import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import UserButton from "@/components/auth/user-button"

export function Sidebar() {
  const t = useTranslations()
  const pathname = usePathname()

  const locale = pathname.split("/")[1]
  const currentPath = pathname.replace(`/${locale}`, "")

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href={`/${locale}/dashboard`} className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6" />
            <span className="">Solar Vision ERP</span>
          </Link>
          <UserButton />
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <Link
              href={`/${locale}/dashboard`}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                currentPath === "/dashboard" ? "bg-muted text-primary" : "text-muted-foreground"
              }`}
            >
              <Home className="h-4 w-4" />
              {t("navigation.dashboard")}
            </Link>
            <Link
              href={`/${locale}/inventory`}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                currentPath === "/inventory" ? "bg-muted text-primary" : "text-muted-foreground"
              }`}
            >
              <Package className="h-4 w-4" />
              {t("navigation.inventory")}
            </Link>
            <Link
              href={`/${locale}/sales`}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                currentPath === "/sales" ? "bg-muted text-primary" : "text-muted-foreground"
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              {t("navigation.sales")}
            </Link>
            <Link
              href={`/${locale}/purchases`}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                currentPath === "/purchases" ? "bg-muted text-primary" : "text-muted-foreground"
              }`}
            >
              <Truck className="h-4 w-4" />
              {t("navigation.purchases")}
            </Link>
            <Link
              href={`/${locale}/clients`}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                currentPath === "/clients" ? "bg-muted text-primary" : "text-muted-foreground"
              }`}
            >
              <Users className="h-4 w-4" />
              {t("navigation.clients")}
            </Link>
            <Link
              href={`/${locale}/suppliers`}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                currentPath === "/suppliers" ? "bg-muted text-primary" : "text-muted-foreground"
              }`}
            >
              <Users className="h-4 w-4" />
              {t("navigation.suppliers")}
            </Link>
            <Link
              href={`/${locale}/expenses`}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                currentPath === "/expenses" ? "bg-muted text-primary" : "text-muted-foreground"
              }`}
            >
              <DollarSign className="h-4 w-4" />
              {t("navigation.expenses")}
            </Link>
            <Link
              href={`/${locale}/reports`}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                currentPath === "/reports" ? "bg-muted text-primary" : "text-muted-foreground"
              }`}
            >
              <LineChart className="h-4 w-4" />
              {t("navigation.reports")}
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
