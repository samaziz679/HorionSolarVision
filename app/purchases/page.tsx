import { fetchPurchases } from "@/lib/data/purchases"
import PurchaseList from "@/components/purchases/purchase-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export default async function PurchasesPage() {
  const purchases = await fetchPurchases()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Achats</h1>
        <Button asChild>
          <Link href="/purchases/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouvel Achat
          </Link>
        </Button>
      </div>
      <PurchaseList purchases={purchases} />
    </div>
  )
}
