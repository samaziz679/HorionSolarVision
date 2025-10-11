"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface CommandHistory {
  id: string
  command: string
  status: "success" | "error" | "processing"
  message: string
  timestamp: Date
}

export function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [commandHistory, setCommandHistory] = useState<CommandHistory[]>([])
  const [browserSupport, setBrowserSupport] = useState(true)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Check browser support for Web Speech API
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) {
        setBrowserSupport(false)
        return
      }

      // Initialize speech recognition
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "fr-FR"

      recognition.onresult = (event: any) => {
        let interim = ""
        let final = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            final += transcript + " "
          } else {
            interim += transcript
          }
        }

        if (final) {
          setTranscript((prev) => prev + final)
          setInterimTranscript("")
        } else {
          setInterimTranscript(interim)
        }
      }

      recognition.onerror = (event: any) => {
        console.error("[v0] Speech recognition error:", event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        if (isListening) {
          recognition.start()
        }
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [isListening])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript("")
      setInterimTranscript("")
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const processCommand = async () => {
    if (!transcript.trim()) return

    const commandId = Date.now().toString()
    const command = transcript.trim()

    // Add to history as processing
    setCommandHistory((prev) => [
      {
        id: commandId,
        command,
        status: "processing",
        message: "Traitement en cours...",
        timestamp: new Date(),
      },
      ...prev,
    ])

    setIsProcessing(true)
    setTranscript("")
    setInterimTranscript("")

    try {
      // Step 1: Process voice command
      const processResponse = await fetch("/api/mcp/process-voice-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      })

      const processResult = await processResponse.json()

      if (!processResult.success) {
        // Update history with error
        setCommandHistory((prev) =>
          prev.map((item) =>
            item.id === commandId
              ? {
                  ...item,
                  status: "error",
                  message: processResult.error || "Erreur lors du traitement",
                }
              : item,
          ),
        )
        setIsProcessing(false)
        return
      }

      // Step 2: Create the sale
      const createResponse = await fetch("/api/mcp/create-sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: processResult.parsedData.productId,
          clientId: processResult.parsedData.clientId,
          quantity: processResult.parsedData.quantity,
          pricePlan: processResult.parsedData.pricePlan,
          unitPrice: processResult.parsedData.unitPrice,
        }),
      })

      const createResult = await createResponse.json()

      if (createResult.success) {
        // Update history with success
        setCommandHistory((prev) =>
          prev.map((item) =>
            item.id === commandId
              ? {
                  ...item,
                  status: "success",
                  message: `Vente créée: ${processResult.parsedData.quantity} ${processResult.parsedData.product} à ${processResult.parsedData.client} (${processResult.parsedData.unitPrice} FCFA/unité)`,
                }
              : item,
          ),
        )
      } else {
        // Update history with error
        setCommandHistory((prev) =>
          prev.map((item) =>
            item.id === commandId
              ? {
                  ...item,
                  status: "error",
                  message: createResult.error || "Erreur lors de la création de la vente",
                }
              : item,
          ),
        )
      }
    } catch (error) {
      console.error("[v0] Error processing command:", error)
      setCommandHistory((prev) =>
        prev.map((item) =>
          item.id === commandId
            ? {
                ...item,
                status: "error",
                message: "Erreur de connexion au serveur",
              }
            : item,
        ),
      )
    } finally {
      setIsProcessing(false)
    }
  }

  if (!browserSupport) {
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
              disabled={isProcessing}
            >
              {isListening ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
            </Button>

            <div className="text-center">
              {isListening && (
                <Badge variant="destructive" className="animate-pulse">
                  En écoute...
                </Badge>
              )}
              {isProcessing && (
                <Badge variant="secondary">
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Traitement...
                </Badge>
              )}
            </div>
          </div>

          {/* Transcript Display */}
          <div className="min-h-[120px] rounded-lg border bg-muted/50 p-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">Transcription:</p>
            <p className="text-base">
              {transcript}
              <span className="text-muted-foreground italic">{interimTranscript}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={processCommand} disabled={!transcript.trim() || isProcessing} className="flex-1">
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                "Exécuter la commande"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setTranscript("")
                setInterimTranscript("")
              }}
              disabled={isProcessing}
            >
              Effacer
            </Button>
          </div>

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
                    {item.status === "processing" && (
                      <Loader2 className="h-5 w-5 text-muted-foreground animate-spin flex-shrink-0" />
                    )}
                  </div>
                  <p
                    className={cn(
                      "text-xs",
                      item.status === "success" && "text-green-600",
                      item.status === "error" && "text-destructive",
                      item.status === "processing" && "text-muted-foreground",
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
  )
}
