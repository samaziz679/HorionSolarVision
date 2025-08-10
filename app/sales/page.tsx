import { fetchSales } from "@/lib/data/sales"
import { SalesList } from "@/components/sales/sales-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"

export default async function SalesPage() {
  const sales = await fetchSales()

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Sales</h1>
        <Button asChild size="sm" className="ml-auto gap-1">
          <Link href="/sales/new">
            New Sale
            <PlusCircle className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesList sales={sales} />
        </CardContent>
      </Card>
    </div>
  )
}
