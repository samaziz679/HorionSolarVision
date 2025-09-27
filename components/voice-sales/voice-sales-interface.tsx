"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Volume2, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { formatMoney } from "@/lib/currency"
import { useToast } from "@/hooks/use-toast"
import type { SpeechRecognition } from "types/speech-recognition" // Assuming SpeechRecognition type is declared in a separate file

interface VoiceCommand {
  id: string
  text: string
  timestamp: Date
  status: "processing" | "confirmed" | "cancelled"
  parsedData?: {
    product: string
    client: string
    quantity: number
    priceType: string
    unitPrice?: number
    total?: number
  }
}

export function VoiceSalesInterface() {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [commands, setCommands] = useState<VoiceCommand[]>([])
  const [currentCommand, setCurrentCommand] = useState<VoiceCommand | null>(null)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const { toast } = useToast()

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      const recognitionInstance = new SpeechRecognition()

      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = "fr-FR"

      recognitionInstance.onstart = () => {
        setIsListening(true)
        console.log("[v0] Voice recognition started")
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
        console.log("[v0] Voice recognition ended")
      }

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        console.log("[v0] Voice command received:", transcript)
        handleVoiceCommand(transcript)
      }

      recognitionInstance.onerror = (event) => {
        console.error("[v0] Speech recognition error:", event.error)
        setIsListening(false)
        toast({
          title: "Erreur de reconnaissance vocale",
          description: "Veuillez réessayer",
          variant: "destructive",
        })
      }

      setRecognition(recognitionInstance)
    } else {
      toast({
        title: "Reconnaissance vocale non supportée",
        description: "Votre navigateur ne supporte pas la reconnaissance vocale",
        variant: "destructive",
      })
    }
  }, [toast])

  const startListening = () => {
    if (recognition && !isListening) {
      recognition.start()
    }
  }

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop()
    }
  }

  const handleVoiceCommand = async (transcript: string) => {
    const commandId = Date.now().toString()
    const newCommand: VoiceCommand = {
      id: commandId,
      text: transcript,
      timestamp: new Date(),
      status: "processing",
    }

    setCommands((prev) => [newCommand, ...prev])
    setCurrentCommand(newCommand)
    setIsProcessing(true)

    try {
      const response = await fetch("/api/mcp/process-voice-command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command: transcript }),
      })

      if (!response.ok) {
        throw new Error("Failed to process command")
      }

      const result = await response.json()
      console.log("[v0] MCP processing result:", result)

      if (result.success && result.parsedData) {
        const updatedCommand = {
          ...newCommand,
          parsedData: result.parsedData,
          status: "processing" as const,
        }

        setCurrentCommand(updatedCommand)
        setCommands((prev) => prev.map((cmd) => (cmd.id === commandId ? updatedCommand : cmd)))

        // Speak confirmation
        speakText(
          `J'ai compris: vendre ${result.parsedData.quantity} ${result.parsedData.product} à ${result.parsedData.client} au ${result.parsedData.priceType}. Confirmez-vous cette vente?`,
        )
      } else {
        throw new Error(result.error || "Command not understood")
      }
    } catch (error) {
      console.error("[v0] Error processing voice command:", error)
      const errorCommand = {
        ...newCommand,
        status: "cancelled" as const,
      }
      setCurrentCommand(null)
      setCommands((prev) => prev.map((cmd) => (cmd.id === commandId ? errorCommand : cmd)))

      toast({
        title: "Commande non comprise",
        description: "Veuillez reformuler votre demande",
        variant: "destructive",
      })

      speakText("Je n'ai pas compris votre commande. Veuillez reformuler.")
    } finally {
      setIsProcessing(false)
    }
  }

  const confirmSale = async () => {
    if (!currentCommand?.parsedData) return

    setIsProcessing(true)
    try {
      const response = await fetch("/api/mcp/create-sale", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentCommand.parsedData),
      })

      if (!response.ok) {
        throw new Error("Failed to create sale")
      }

      const result = await response.json()
      console.log("[v0] Sale creation result:", result)

      if (result.success) {
        const confirmedCommand = {
          ...currentCommand,
          status: "confirmed" as const,
        }

        setCommands((prev) => prev.map((cmd) => (cmd.id === currentCommand.id ? confirmedCommand : cmd)))
        setCurrentCommand(null)

        toast({
          title: "Vente créée avec succès",
          description: `Vente de ${formatMoney(result.sale.total)} enregistrée`,
        })

        speakText(`Vente confirmée pour un montant de ${formatMoney(result.sale.total)}`)
      } else {
        throw new Error(result.error || "Failed to create sale")
      }
    } catch (error) {
      console.error("[v0] Error creating sale:", error)
      toast({
        title: "Erreur lors de la création",
        description: "Impossible de créer la vente",
        variant: "destructive",
      })

      speakText("Erreur lors de la création de la vente")
    } finally {
      setIsProcessing(false)
    }
  }

  const cancelSale = () => {
    if (!currentCommand) return

    const cancelledCommand = {
      ...currentCommand,
      status: "cancelled" as const,
    }

    setCommands((prev) => prev.map((cmd) => (cmd.id === currentCommand.id ? cancelledCommand : cmd)))
    setCurrentCommand(null)

    speakText("Vente annulée")
    toast({
      title: "Vente annulée",
      description: "La commande a été annulée",
    })
  }

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "fr-FR"
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="space-y-6">
      {/* Voice Control Panel */}
      <Card className="bg-gradient-to-br from-white to-orange-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-solar-orange" />
            Contrôle Vocal
          </CardTitle>
          <CardDescription>Cliquez sur le microphone et donnez votre commande de vente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className={`h-20 w-20 rounded-full ${
                isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-solar-orange hover:bg-orange-600"
              }`}
            >
              {isProcessing ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : isListening ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {isProcessing
                ? "Traitement en cours..."
                : isListening
                  ? "🎤 Écoute en cours... Parlez maintenant"
                  : "Cliquez sur le microphone pour commencer"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Panel */}
      {currentCommand?.parsedData && (
        <Card className="border-l-4 border-l-amber-500 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="text-amber-700">Confirmation de Vente</CardTitle>
            <CardDescription>Vérifiez les détails avant de confirmer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Produit</p>
                <p className="text-lg">{currentCommand.parsedData.product}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Client</p>
                <p className="text-lg">{currentCommand.parsedData.client}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Quantité</p>
                <p className="text-lg">{currentCommand.parsedData.quantity}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Type de Prix</p>
                <p className="text-lg">{currentCommand.parsedData.priceType}</p>
              </div>
            </div>

            {currentCommand.parsedData.total && (
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold text-solar-orange">{formatMoney(currentCommand.parsedData.total)}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={confirmSale} disabled={isProcessing} className="flex-1">
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirmer la Vente
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={cancelSale} disabled={isProcessing} className="flex-1 bg-transparent">
                <XCircle className="mr-2 h-4 w-4" />
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Command History */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Commandes</CardTitle>
          <CardDescription>Dernières commandes vocales traitées</CardDescription>
        </CardHeader>
        <CardContent>
          {commands.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucune commande vocale pour le moment</p>
          ) : (
            <div className="space-y-3">
              {commands.map((command) => (
                <div key={command.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="flex-1">
                    <p className="font-medium">{command.text}</p>
                    <p className="text-sm text-muted-foreground">{command.timestamp.toLocaleTimeString("fr-FR")}</p>
                    {command.parsedData && (
                      <div className="mt-2 text-sm">
                        <span className="text-muted-foreground">
                          {command.parsedData.quantity} × {command.parsedData.product}→ {command.parsedData.client}
                        </span>
                      </div>
                    )}
                  </div>
                  <Badge
                    variant={
                      command.status === "confirmed"
                        ? "default"
                        : command.status === "cancelled"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {command.status === "confirmed"
                      ? "Confirmé"
                      : command.status === "cancelled"
                        ? "Annulé"
                        : "En cours"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
