import { AlertTriangle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function AuthCodeErrorPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl">Erreur d'Authentification</CardTitle>
          <CardDescription>Le lien de connexion est invalide ou a expiré</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Cela peut arriver si :</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Le lien a expiré (valide 1 heure)</li>
              <li>Le lien a déjà été utilisé</li>
              <li>Il y a eu une erreur de réseau</li>
            </ul>
          </div>
          <div className="space-y-2">
            <Link href="/login" className="w-full">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la Connexion
              </Button>
            </Link>
            <p className="text-xs text-center text-muted-foreground">
              Vous pouvez demander un nouveau lien de connexion
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
