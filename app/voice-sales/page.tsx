import { Suspense } from "react"
import { VoiceSalesInterface } from "@/components/voice-sales/voice-sales-interface"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"
import { Mic } from "lucide-react"

export default function VoiceSalesPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
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
              <BreadcrumbLink>Assistant Vocal</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-solar-orange flex items-center gap-2">
            <Mic className="h-8 w-8" />
            Assistant de Vente Vocal
          </h1>
          <p className="text-muted-foreground">Créez des ventes rapidement par commande vocale en français</p>
        </div>

        <Card className="border-l-4 border-l-solar-orange">
          <CardHeader>
            <CardTitle className="text-solar-orange">Comment utiliser l'assistant vocal</CardTitle>
            <CardDescription>Exemples de commandes que vous pouvez utiliser</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="text-sm font-medium">💬 "Vendre 3 batteries à M. Ouedraogo au prix grossiste"</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="text-sm font-medium">💬 "Créer une vente de 2 panneaux solaires pour Mme Kaboré"</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="text-sm font-medium">💬 "Vendre 5 onduleurs à prix détail 1 pour M. Sawadogo"</p>
            </div>
          </CardContent>
        </Card>

        <Suspense fallback={<div>Chargement de l'interface vocale...</div>}>
          <VoiceSalesInterface />
        </Suspense>
      </div>
    </div>
  )
}
