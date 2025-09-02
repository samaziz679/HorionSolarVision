import { fetchPurchases } from "@/lib/data/purchases"
import PurchaseList from "@/components/purchases/purchase-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle, Upload } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default async function PurchasesPage() {
  const purchases = await fetchPurchases()

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Tableau de bord</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Achats</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex gap-2">
          <Button asChild variant="outline">
            <Link href="/purchases/bulk-import">
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Link>
          </Button>
          <Button asChild>
            <Link href="/purchases/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nouvel Achat
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <PurchaseList purchases={purchases} />
      </div>
    </main>
  )
}
