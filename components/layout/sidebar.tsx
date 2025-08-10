'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BanknoteIcon, CreditCardIcon, HomeIcon, PackageIcon, ShoppingCartIcon, UsersIcon, LogOutIcon, DollarSignIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Logged out successfully!')
      router.push('/login')
      router.refresh()
    }
  }

  const navItems = [
    { href: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { href: '/clients', icon: UsersIcon, label: 'Clients' },
    { href: '/inventory', icon: PackageIcon, label: 'Inventory' },
    { href: '/sales', icon: ShoppingCartIcon, label: 'Sales' },
    { href: '/purchases', icon: CreditCardIcon, label: 'Purchases' },
    { href: '/expenses', icon: DollarSignIcon, label: 'Expenses' },
    { href: '/banking', icon: BanknoteIcon, label: 'Banking' },
    { href: '/suppliers', icon: UsersIcon, label: 'Suppliers' }, // Reusing UsersIcon for Suppliers
  ]

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-gray-100/40 dark:bg-gray-800/40">
      <div className="flex h-[60px] items-center border-b px-6">
        <Link className="flex items-center gap-2 font-semibold" href="/dashboard">
          <img src="/placeholder-logo.svg" alt="Solar Vision ERP Logo" className="h-6 w-6" />
          <span className="">Solar Vision ERP</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-gray-900 dark:hover:text-gray-50 ${
                  isActive ? 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-50' : 'text-gray-500 dark:text-gray-400'
                }`}
                href={item.href}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
        <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
          <LogOutIcon className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
