"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Mic, MicOff, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSaleVoiceCommands } from "@/components/sales/use-sale-voice-commands"
import { createSale, type State } from "@/app/sales/actions"
import { useFormState } from "react-dom"

type FormState = {
  productId: string
  clientId: string
  quantity: number
  pricePlan: string
  unitPrice: number
  saleDate: string
  notes: string
}

interface CommandHistory {
  id: string
  command: string
  status: "success" | "error"
  message: string
  timestamp: Date
}

export function VoiceAssistant() {
  const [formState, setFormState] = useState<FormState>({
    productId: "",
    clientId: "",
    quantity: 0,
    pricePlan: "",
    unitPrice: 0,
    saleDate: new Date().toISOString().split("T")[0],
    notes: "",
  })

  const [commandHistory, setCommandHistory] = useState<CommandHistory[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverState, formAction] = useFormState<State, FormData>(createSale, {})

  const {
    isListening,
    transcript,
    error: voiceError,
    isSupported,
    startListening,
    stopListening,
    pendingConfirmation,
    confirmationData,
    confirmSubmission,
    cancelSubmission,
  } = useSaleVoiceCommands({
    setProductId: (id) => setFormState((prev) => ({ ...prev, productId: id })),
    setClientId: (id) => setFormState((prev) => ({ ...prev, clientId: id })),
    setQuantity: (qty) => setFormState((prev) => ({ ...prev, quantity: qty })),
    setPricePlan: (plan) => setFormState((prev) => ({ ...prev, pricePlan: plan })),
    setUnitPrice: (price) => setFormState((prev) => ({ ...prev, unitPrice: price })),
    setSaleDate: (date) => setFormState((prev) => ({ ...prev, saleDate: date })),
    setNotes: (notes) => setFormState((prev) => ({ ...prev, notes: notes })),
  })

  const handleConfirm = async () => {
    if (!confirmationData) return

    setIsSubmitting(true)
    const commandId = Date.now().toString()

    try {
      // Create FormData for server action
      const formData = new FormData()
      formData.append("product_id", formState.productId)
      formData.append("client_id", formState.clientId)
      formData.append("quantity", formState.quantity.toString())
      formData.append("price_plan", formState.pricePlan)
      formData.append("unit_price", formState.unitPrice.toString())
      formData.append("sale_date", formState.saleDate)
      formData.append("notes", formState.notes || "Créé via commande vocale")

      // Call the existing createSale server action
      const result = await createSale({}, formData)

      if (result.success === false) {
        // Add error to history
        setCommandHistory((prev) => [
          {
            id: commandId,
            command: transcript,
            status: "error",
            message: result.message || "Erreur lors de la création de la vente",
            timestamp: new Date(),
          },
          ...prev,
        ])
      } else {
        // Add success to history
        setCommandHistory((prev) => [
          {
            id: commandId,
            command: transcript,
            status: "success",
            message: `Vente créée: ${confirmationData.quantity} ${confirmationData.productName} à ${confirmationData.clientName} (${confirmationData.unitPrice} FCFA/unité)`,
            timestamp: new Date(),
          },
          ...prev,
        ])

        // Reset form state
        setFormState({
          productId: "",
          clientId: "",
          quantity: 0,
          pricePlan: "",
          unitPrice: 0,
          saleDate: new Date().toISOString().split("T")[0],
          notes: "",
        })
      }

      confirmSubmission()
    } catch (error) {
      console.error("[v0] Error creating sale:", error)
      setCommandHistory((prev) => [
        {
          id: commandId,
          command: transcript,
          status: "error",
          message: "Erreur de connexion au serveur",
          timestamp: new Date(),
        },
        ...prev,
      ])
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Navigateur non supporté
          </CardTitle>
          <CardDescription>
            Votre navigateur ne supporte pas la reconnaissance vocale. Veuillez utiliser Chrome, Edge ou Safari.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {/* Voice Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Contrôle Vocal</CardTitle>
            <CardDescription>Dites: "Vendre [quantité] [produit] à [client] au prix [gros/détail]"</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Microphone Button */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <Button
                size="lg"
                variant={isListening ? "destructive" : "default"}
                className={cn(
                  "h-24 w-24 rounded-full transition-all",
                  isListening && "animate-pulse shadow-lg shadow-destructive/50",
                )}
                onClick={isListening ? stopListening : startListening}
                disabled={isSubmitting}
              >
                {isListening ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
              </Button>

              <div className="text-center">
                {isListening && (
                  <Badge variant="destructive" className="animate-pulse">
                    En écoute...
                  </Badge>
                )}
                {isSubmitting && (
                  <Badge variant="secondary">
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Création en cours...
                  </Badge>
                )}
              </div>
            </div>

            {/* Transcript Display */}
            <div className="min-h-[120px] rounded-lg border bg-muted/50 p-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">Transcription:</p>
              <p className="text-base">{transcript || "Cliquez sur le microphone pour commencer..."}</p>
              {voiceError && <p className="text-sm text-destructive mt-2">{voiceError}</p>}
            </div>

            {/* Current Form State */}
            {formState.productId && (
              <div className="rounded-lg border bg-card p-3 space-y-1">
                <p className="text-xs font-medium">État actuel:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {formState.quantity > 0 && <li>• Quantité: {formState.quantity}</li>}
                  {formState.pricePlan && <li>• Plan tarifaire: {formState.pricePlan}</li>}
                  {formState.unitPrice > 0 && <li>• Prix unitaire: {formState.unitPrice} FCFA</li>}
                </ul>
              </div>
            )}

            {/* Example Commands */}
            <div className="rounded-lg border bg-card p-3">
              <p className="text-xs font-medium mb-2">Exemples de commandes:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• "Vendre 5 panneaux solaires à Ouagadougou Solar au prix gros"</li>
                <li>• "Vendre 10 batteries à Client ABC au prix détail"</li>
                <li>• "Vendre 3 onduleurs à Société XYZ au prix grossiste"</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Command History */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des commandes</CardTitle>
            <CardDescription>Dernières commandes vocales exécutées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {commandHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Aucune commande pour le moment</p>
              ) : (
                commandHistory.map((item) => (
                  <div key={item.id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium flex-1">{item.command}</p>
                      {item.status === "success" && <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />}
                      {item.status === "error" && <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />}
                    </div>
                    <p
                      className={cn(
                        "text-xs",
                        item.status === "success" && "text-green-600",
                        item.status === "error" && "text-destructive",
                      )}
                    >
                      {item.message}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.timestamp.toLocaleTimeString("fr-FR")}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={pendingConfirmation} onOpenChange={(open) => !open && cancelSubmission()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la vente</DialogTitle>
            <DialogDescription>Veuillez vérifier les détails de la vente avant de confirmer.</DialogDescription>
          </DialogHeader>

          {confirmationData && (
            <div className="space-y-3 py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="font-medium">Produit:</span>
                <span>{confirmationData.productName}</span>

                <span className="font-medium">Client:</span>
                <span>{confirmationData.clientName}</span>

                <span className="font-medium">Quantité:</span>
                <span>{confirmationData.quantity}</span>

                <span className="font-medium">Plan tarifaire:</span>
                <span className="capitalize">{confirmationData.pricePlan}</span>

                <span className="font-medium">Prix unitaire:</span>
                <span>{confirmationData.unitPrice} FCFA</span>

                <span className="font-medium">Total:</span>
                <span className="font-bold">{confirmationData.quantity * confirmationData.unitPrice} FCFA</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={cancelSubmission} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button onClick={handleConfirm} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Confirmer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
