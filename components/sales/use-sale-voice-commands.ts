"use client"

import { useState, useEffect, useRef, useCallback } from "react"

type PricePlan = "detail_1" | "detail_2" | "gros"

type VoiceHookProps = {
  products: { id: string; name: string; sku?: string }[]
  onSelectProduct: (productId: string) => void
  onSelectPricePlan: (plan: PricePlan) => void
  onQuantity: (value: number) => void
  onUnitPrice: (value: number) => void
  onRequestSubmit: () => void
}

type VoiceHookReturn = {
  isSupported: boolean
  isListening: boolean
  transcript: string
  statusMessage: string
  error: string | null
  pendingConfirmation: boolean
  startListening: () => void
  stopListening: () => void
  reset: () => void
  handleConfirm: () => void
}

// Simple Levenshtein distance for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

// Fuzzy product matching with tolerance for minor misspellings
function fuzzyFindProduct(
  query: string,
  products: { id: string; name: string; sku?: string }[],
): { id: string; name: string } | null {
  const normalizedQuery = query.toLowerCase().trim()

  // First try exact match
  const exactMatch = products.find(
    (p) => p.name.toLowerCase() === normalizedQuery || p.sku?.toLowerCase() === normalizedQuery,
  )
  if (exactMatch) return exactMatch

  // Then try substring match
  const substringMatch = products.find(
    (p) => p.name.toLowerCase().includes(normalizedQuery) || normalizedQuery.includes(p.name.toLowerCase()),
  )
  if (substringMatch) return substringMatch

  // Finally try fuzzy match with Levenshtein distance
  let bestMatch: { id: string; name: string } | null = null
  let bestDistance = Number.POSITIVE_INFINITY

  for (const product of products) {
    const distance = levenshteinDistance(normalizedQuery, product.name.toLowerCase())
    const threshold = Math.max(3, Math.floor(product.name.length * 0.3)) // 30% tolerance

    if (distance < threshold && distance < bestDistance) {
      bestDistance = distance
      bestMatch = product
    }
  }

  return bestMatch
}

export function useSaleVoiceCommands(props: VoiceHookProps): VoiceHookReturn {
  const { products, onSelectProduct, onSelectPricePlan, onQuantity, onUnitPrice, onRequestSubmit } = props

  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [statusMessage, setStatusMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pendingConfirmation, setPendingConfirmation] = useState(false)

  const recognitionRef = useRef<any>(null)
  const confirmCallbackRef = useRef<(() => void) | null>(null)

  // Feature detection
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      setIsSupported(!!SpeechRecognition)

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "fr-FR" // French language support
      }
    }
  }, [])

  // Process voice commands
  const processCommand = useCallback(
    (text: string) => {
      const normalized = text.toLowerCase().trim()
      console.log("[v0] Processing voice command:", normalized)

      // Product selection: "sélectionner [nom du produit]" or "produit [nom]"
      if (normalized.includes("sélectionner") || normalized.includes("produit")) {
        const productQuery = normalized
          .replace(/sélectionner/gi, "")
          .replace(/produit/gi, "")
          .replace(/le/gi, "")
          .replace(/la/gi, "")
          .trim()

        const product = fuzzyFindProduct(productQuery, products)
        if (product) {
          onSelectProduct(product.id)
          setStatusMessage(`Produit sélectionné: ${product.name}`)
          console.log("[v0] Product selected:", product.name)
        } else {
          setError(`Produit non trouvé: "${productQuery}"`)
          console.log("[v0] Product not found:", productQuery)
        }
        return
      }

      // Price plan selection
      if (normalized.includes("détail") && normalized.includes("1")) {
        onSelectPricePlan("detail_1")
        setStatusMessage("Plan de prix: Détail 1")
        console.log("[v0] Price plan set to: detail_1")
        return
      }
      if (normalized.includes("détail") && normalized.includes("2")) {
        onSelectPricePlan("detail_2")
        setStatusMessage("Plan de prix: Détail 2")
        console.log("[v0] Price plan set to: detail_2")
        return
      }
      if (normalized.includes("gros") || normalized.includes("wholesale")) {
        onSelectPricePlan("gros")
        setStatusMessage("Plan de prix: Gros")
        console.log("[v0] Price plan set to: gros")
        return
      }

      // Quantity: "quantité [nombre]" or "[nombre] unités"
      const quantityMatch =
        normalized.match(/quantité\s+(\d+)/) ||
        normalized.match(/(\d+)\s+unités?/) ||
        normalized.match(/(\d+)\s+pièces?/)
      if (quantityMatch) {
        const qty = Number.parseInt(quantityMatch[1], 10)
        if (!isNaN(qty) && qty > 0) {
          onQuantity(qty)
          setStatusMessage(`Quantité: ${qty}`)
          console.log("[v0] Quantity set to:", qty)
          return
        }
      }

      // Unit price: "prix [montant]" or "[montant] francs"
      const priceMatch =
        normalized.match(/prix\s+(\d+(?:[.,]\d+)?)/) ||
        normalized.match(/(\d+(?:[.,]\d+)?)\s+francs?/) ||
        normalized.match(/(\d+(?:[.,]\d+)?)\s+fcfa/)
      if (priceMatch) {
        const price = Number.parseFloat(priceMatch[1].replace(",", "."))
        if (!isNaN(price) && price > 0) {
          onUnitPrice(price)
          setStatusMessage(`Prix unitaire: ${price} FCFA`)
          console.log("[v0] Unit price set to:", price)
          return
        }
      }

      // Review: "réviser" or "vérifier"
      if (normalized.includes("réviser") || normalized.includes("vérifier") || normalized.includes("review")) {
        setPendingConfirmation(true)
        onRequestSubmit()
        setStatusMessage("Veuillez confirmer la vente")
        console.log("[v0] Review requested, pending confirmation")
        return
      }

      // Confirm: "confirmer" or "oui"
      if (
        (normalized.includes("confirmer") || normalized.includes("oui") || normalized.includes("confirm")) &&
        pendingConfirmation
      ) {
        console.log("[v0] Confirmation received")
        setPendingConfirmation(false)
        setStatusMessage("Vente confirmée")
        if (confirmCallbackRef.current) {
          confirmCallbackRef.current()
        }
        return
      }

      // If no command matched
      setStatusMessage("Commande non reconnue. Essayez: 'sélectionner [produit]', 'quantité [nombre]', 'réviser'")
      console.log("[v0] Command not recognized:", normalized)
    },
    [products, onSelectProduct, onSelectPricePlan, onQuantity, onUnitPrice, onRequestSubmit, pendingConfirmation],
  )

  // Setup recognition handlers
  useEffect(() => {
    if (!recognitionRef.current) return

    const recognition = recognitionRef.current

    recognition.onresult = (event: any) => {
      let interimTranscript = ""
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " "
        } else {
          interimTranscript += transcript
        }
      }

      setTranscript(finalTranscript || interimTranscript)

      if (finalTranscript) {
        processCommand(finalTranscript)
      }
    }

    recognition.onerror = (event: any) => {
      console.error("[v0] Speech recognition error:", event.error)
      if (event.error === "no-speech") {
        setError("Aucune parole détectée. Veuillez réessayer.")
      } else if (event.error === "not-allowed") {
        setError("Microphone non autorisé. Veuillez autoriser l'accès au microphone.")
      } else {
        setError(`Erreur de reconnaissance vocale: ${event.error}`)
      }
      setIsListening(false)
    }

    recognition.onend = () => {
      console.log("[v0] Speech recognition ended")
      setIsListening(false)
    }
  }, [processCommand])

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return

    try {
      setError(null)
      setStatusMessage("Écoute en cours...")
      setTranscript("")
      recognitionRef.current.start()
      setIsListening(true)
      console.log("[v0] Speech recognition started")
    } catch (err) {
      console.error("[v0] Error starting recognition:", err)
      setError("Impossible de démarrer la reconnaissance vocale")
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return

    try {
      recognitionRef.current.stop()
      setIsListening(false)
      setStatusMessage("Écoute arrêtée")
      console.log("[v0] Speech recognition stopped")
    } catch (err) {
      console.error("[v0] Error stopping recognition:", err)
    }
  }, [isListening])

  const reset = useCallback(() => {
    setTranscript("")
    setStatusMessage("")
    setError(null)
    setPendingConfirmation(false)
    if (isListening) {
      stopListening()
    }
  }, [isListening, stopListening])

  const handleConfirm = useCallback(() => {
    console.log("[v0] handleConfirm called")
    // This will be set by the SaleForm component
  }, [])

  // Store the confirm callback
  useEffect(() => {
    confirmCallbackRef.current = handleConfirm
  }, [handleConfirm])

  return {
    isSupported,
    isListening,
    transcript,
    statusMessage,
    error,
    pendingConfirmation,
    startListening,
    stopListening,
    reset,
    handleConfirm,
  }
}
