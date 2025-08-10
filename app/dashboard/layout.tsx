import type React from "react"
import { getAuthUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import UserButton from "@/components/auth/user-button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import {
  MenuIcon,
  HomeIcon,
  BanknoteIcon,
  UsersIcon,
  PackageIcon,
  ShoppingCartIcon,
  BarChartIcon,
  LandmarkIcon,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // You can keep both getAuthUser and the explicit Supabase check for clarity
  const user = await getAuthUser()
  const supabase = createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect("/login")
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center border-b px-6">
            <Link className="flex items-center gap-2 font-semibold" href="/dashboard">
              <Image src="/placeholder-logo.png" alt="Solar Vision ERP Logo" width={24} height={24} />
              <span>Solar Vision ERP</span>
            </Link>
            <div className="ml-auto">
              <UserButton user={user} />
            </div>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900 transition-all hover:text-gray-900 dark:text-gray-50 dark:hover:text-gray-50"
                href="/dashboard"
              >
                <HomeIcon className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                href="/clients"
              >
                <UsersIcon className="h-4 w-4" />
                Clients
              </Link>
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                href="/suppliers"
              >
                <LandmarkIcon className="h-4 w-4" />
                Suppliers
              </Link>
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                href="/inventory"
              >
                <PackageIcon className="h-4 w-4" />
                Inventory
              </Link>
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                href="/sales"
              >
                <ShoppingCartIcon className="h-4 w-4" />
                Sales
              </Link>
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                href="/purchases"
              >
                <BarChartIcon className="h-4 w-4" />
                Purchases
              </Link>
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                href="/expenses"
              >
                <BanknoteIcon className="h-4 w-4" />
                Expenses
              </Link>
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                href="/banking"
              >
                <LandmarkIcon className="h-4 w-4" />
                Banking
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="lg:hidden bg-transparent" size="icon" variant="outline">
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <Link className="flex items-center gap-2 font-semibold" href="/dashboard">
                <Image src="/placeholder-logo.png" alt="Solar Vision ERP Logo" width={24} height={24} />
                <span>Solar Vision ERP</span>
              </Link>
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-gray-900 hover:text-gray-900 dark:text-gray-50 dark:hover:text-gray-50"
                  href="/dashboard"
                >
                  <HomeIcon className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                  href="/clients"
                >
                  <UsersIcon className="h-5 w-5" />
                  Clients
                </Link>
                <Link
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                  href="/suppliers"
                >
                  <LandmarkIcon className="h-5 w-5" />
                  Suppliers
                </Link>
                <Link
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                  href="/inventory"
                >
                  <PackageIcon className="h-5 w-5" />
                  Inventory
                </Link>
                <Link
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                  href="/sales"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  Sales
                </Link>
                <Link
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                  href="/purchases"
                >
                  <BarChartIcon className="h-5 w-5" />
                  Purchases
                </Link>
                <Link
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                  href="/expenses"
                >
                  <BanknoteIcon className="h-5 w-5" />
                  Expenses
                </Link>
                <Link
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                  href="/banking"
                >
                  <LandmarkIcon className="h-5 w-5" />
                  Banking
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1" />
          <UserButton user={user} />
        </header>
        {children}
      </div>
    </div>
  )
}
