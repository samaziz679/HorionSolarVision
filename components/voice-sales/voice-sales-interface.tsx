"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Volume2, CheckCircle, XCircle, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface VoiceCommand {
  id: string
  text: string
  timestamp: Date
  status: "processing" | "confirmed" | "executed" | "error"
  parsedData?: {
    product: string
    quantity: number
    client: string
    priceType: string
  }
  error?: string
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onerror: ((this: SpeechRecognition, ev: Event) => any) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export function VoiceSalesInterface() {
  const [isListening, setIsListening] = useState(false)
  const [commands, setCommands] = useState<VoiceCommand[]>([])
  const [currentTranscript, setCurrentTranscript] = useState("")
  const [isSupported, setIsSupported] = useState(false)
  const [pendingCommand, setPendingCommand] = useState<VoiceCommand | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setIsSupported(true)
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "fr-FR" // French language for Burkina Faso

      recognitionRef.current.onstart = () => {
        setIsListening(true)
        speak("Je vous écoute")
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        setCurrentTranscript(transcript)

        // Process final result
        if (event.results[event.results.length - 1].isFinal) {
          processVoiceCommand(transcript)
          setCurrentTranscript("")
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event)
        setIsListening(false)
        speak("Désolé, je n'ai pas pu vous entendre. Veuillez réessayer.")
      }
    }

    // Initialize speech synthesis
    if ("speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  const speak = (text: string) => {
    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "fr-FR"
      utterance.rate = 0.9
      synthRef.current.speak(utterance)
    }
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  const processVoiceCommand = async (transcript: string) => {
    const command: VoiceCommand = {
      id: Date.now().toString(),
      text: transcript,
      timestamp: new Date(),
      status: "processing",
    }

    setCommands((prev) => [command, ...prev])

    try {
      // Send to MCP API for processing
      const response = await fetch("/api/mcp/process-voice-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: transcript }),
      })

      const result = await response.json()

      if (result.success && result.parsedData) {
        const updatedCommand = {
          ...command,
          status: "confirmed" as const,
          parsedData: result.parsedData,
        }

        setCommands((prev) => prev.map((c) => (c.id === command.id ? updatedCommand : c)))
        setPendingCommand(updatedCommand)

        // Ask for confirmation
        const confirmationText = `J'ai compris: vendre ${result.parsedData.quantity} ${result.parsedData.product} à ${result.parsedData.client} au ${result.parsedData.priceType}. Confirmez-vous cette vente?`
        speak(confirmationText)
      } else {
        const errorCommand = {
          ...command,
          status: "error" as const,
          error: result.error || "Commande non reconnue",
        }
        setCommands((prev) => prev.map((c) => (c.id === command.id ? errorCommand : c)))
        speak(
          "Je n'ai pas compris votre commande. Veuillez répéter en disant par exemple: Vendre 3 batteries à Monsieur Ouedraogo au prix grossiste",
        )
      }
    } catch (error) {
      console.error("Error processing voice command:", error)
      const errorCommand = {
        ...command,
        status: "error" as const,
        error: "Erreur de traitement",
      }
      setCommands((prev) => prev.map((c) => (c.id === command.id ? errorCommand : c)))
      speak("Une erreur s'est produite. Veuillez réessayer.")
    }
  }

  const confirmSale = async () => {
    if (!pendingCommand || !pendingCommand.parsedData) return

    try {
      const response = await fetch("/api/mcp/create-sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingCommand.parsedData),
      })

      const result = await response.json()

      if (result.success) {
        const executedCommand = {
          ...pendingCommand,
          status: "executed" as const,
        }
        setCommands((prev) => prev.map((c) => (c.id === pendingCommand.id ? executedCommand : c)))
        setPendingCommand(null)
        speak("Vente enregistrée avec succès!")
      } else {
        const errorCommand = {
          ...pendingCommand,
          status: "error" as const,
          error: result.error || "Erreur lors de la création de la vente",
        }
        setCommands((prev) => prev.map((c) => (c.id === pendingCommand.id ? errorCommand : c)))
        setPendingCommand(null)
        speak(`Erreur: ${result.error}`)
      }
    } catch (error) {
      console.error("Error creating sale:", error)
      speak("Erreur lors de l'enregistrement de la vente")
    }
  }

  const cancelSale = () => {
    if (pendingCommand) {
      const cancelledCommand = {
        ...pendingCommand,
        status: "error" as const,
        error: "Annulé par l'utilisateur",
      }
      setCommands((prev) => prev.map((c) => (c.id === pendingCommand.id ? cancelledCommand : c)))
      setPendingCommand(null)
      speak("Vente annulée")
    }
  }

  const getStatusIcon = (status: VoiceCommand["status"]) => {
    switch (status) {
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case "executed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: VoiceCommand["status"]) => {
    switch (status) {
      case "processing":
        return <Badge variant="secondary">En cours</Badge>
      case "confirmed":
        return <Badge variant="outline">En attente</Badge>
      case "executed":
        return <Badge variant="default">Exécuté</Badge>
      case "error":
        return <Badge variant="destructive">Erreur</Badge>
    }
  }

  if (!isSupported) {
    return (
      <Alert>
        <AlertDescription>
          La reconnaissance vocale n'est pas supportée par votre navigateur. Veuillez utiliser Chrome, Edge ou Safari
          pour accéder à cette fonctionnalité.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Voice Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Contrôle Vocal
          </CardTitle>
          <CardDescription>Utilisez des commandes vocales en français pour créer des ventes rapidement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={isListening ? stopListening : startListening}
              variant={isListening ? "destructive" : "default"}
              size="lg"
              className="flex items-center gap-2"
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isListening ? "Arrêter l'écoute" : "Commencer l'écoute"}
            </Button>

            <Button
              onClick={() => speak("Dites par exemple: Vendre 3 batteries à Monsieur Ouedraogo au prix grossiste")}
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              <Volume2 className="h-4 w-4" />
              Exemple
            </Button>
          </div>

          {currentTranscript && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">En cours de transcription:</p>
              <p className="font-medium">{currentTranscript}</p>
            </div>
          )}

          {pendingCommand && (
            <Alert>
              <AlertDescription className="space-y-3">
                <p>
                  <strong>Confirmation requise:</strong>
                </p>
                <div className="bg-background p-3 rounded border">
                  <p>
                    <strong>Produit:</strong> {pendingCommand.parsedData?.product}
                  </p>
                  <p>
                    <strong>Quantité:</strong> {pendingCommand.parsedData?.quantity}
                  </p>
                  <p>
                    <strong>Client:</strong> {pendingCommand.parsedData?.client}
                  </p>
                  <p>
                    <strong>Prix:</strong> {pendingCommand.parsedData?.priceType}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={confirmSale} size="sm">
                    Confirmer la vente
                  </Button>
                  <Button onClick={cancelSale} variant="outline" size="sm">
                    Annuler
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions d'utilisation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Exemples de commandes vocales:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>"Vendre 3 batteries à Monsieur Ouedraogo au prix grossiste"</li>
              <li>"Vendre 5 panneaux solaires à Madame Kaboré au prix détail"</li>
              <li>"Vendre 2 onduleurs à Monsieur Sawadogo au prix de gros"</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-4">
              L'assistant vocal utilise la reconnaissance vocale en français et demande toujours confirmation avant
              d'enregistrer une vente.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Command History */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des commandes</CardTitle>
          <CardDescription>Dernières commandes vocales traitées</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {commands.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Aucune commande vocale encore. Commencez par cliquer sur "Commencer l'écoute".
              </p>
            ) : (
              commands.map((command) => (
                <div key={command.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getStatusIcon(command.status)}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{command.text}</p>
                      {getStatusBadge(command.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">{command.timestamp.toLocaleString("fr-FR")}</p>
                    {command.parsedData && (
                      <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                        {command.parsedData.quantity} {command.parsedData.product} → {command.parsedData.client} (
                        {command.parsedData.priceType})
                      </div>
                    )}
                    {command.error && <p className="text-xs text-red-600">{command.error}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
