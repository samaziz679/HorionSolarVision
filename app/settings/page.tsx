import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CompanySettingsForm } from "@/components/settings/company-settings-form"

export default function SettingsPage() {
  return (
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
  )
}
