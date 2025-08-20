import { fetchProducts } from "@/lib/data/products"
import ProductList from "@/components/inventory/product-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const currentPage = Number(searchParams?.page) || 1
  const { products, totalPages, hasNextPage, hasPrevPage } = await fetchProducts(currentPage, 10)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Inventaire</CardTitle>
        <Button asChild>
          <Link href="/inventory/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter Produit
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <ProductList products={products} />

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
  )
}
