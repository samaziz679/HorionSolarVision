import { fetchProductsWithBatches } from "@/lib/data/stock-lots"
import ProductListWithBatches from "@/components/inventory/product-list-with-batches"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const currentPage = Number(searchParams?.page) || 1
  const { products, totalPages, hasNextPage, hasPrevPage } = await fetchProductsWithBatches(currentPage, 10)

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
              <BreadcrumbLink>Inventaire</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Inventaire avec Gestion des Lots</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Gérez vos stocks avec traçabilité complète des lots et batches
            </p>
          </div>
          <Button asChild>
            <Link href="/inventory/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter Produit
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <ProductListWithBatches products={products} />

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" asChild disabled={!hasPrevPage}>
                  <Link href={`/inventory?page=${currentPage - 1}`}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild disabled={!hasNextPage}>
                  <Link href={`/inventory?page=${currentPage + 1}`}>
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
