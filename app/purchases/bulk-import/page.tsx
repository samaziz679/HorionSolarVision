import { Suspense } from "react"
import { requireAuth } from "@/lib/auth/auth-utils"
import { BulkPurchaseImport } from "@/components/purchases/bulk-purchase-import"

export default async function BulkImportPage() {
  await requireAuth()

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-orange-600">Import Achats en Lot</h1>
        <p className="text-gray-600 mt-2">Importez plusieurs achats simultanément via un fichier CSV</p>
      </div>

      <Suspense fallback={<div>Chargement...</div>}>
        <BulkPurchaseImport />
      </Suspense>
    </div>
  )
}
