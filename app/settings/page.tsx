import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CompanySettingsForm } from "@/components/settings/company-settings-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default function SettingsPage() {
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
              <BreadcrumbLink>Paramètres</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-solar-orange">Paramètres</h1>
          <p className="text-muted-foreground">Gérez les paramètres de votre entreprise et personnalisez votre ERP</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de l'entreprise</CardTitle>
              <CardDescription>Modifiez le nom, le logo et les détails de votre entreprise</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Chargement...</div>}>
                <CompanySettingsForm />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
