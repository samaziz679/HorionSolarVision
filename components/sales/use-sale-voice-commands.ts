"use client"

import { useState, useEffect, useRef, useCallback } from "react"

type PricePlan = "detail_1" | "detail_2" | "gros"

type VoiceHookProps = {
  products: { id: string; name: string; sku?: string }[]
  clients: { id: string; name: string }[]
  onSelectProduct: (productId: string) => void
  onSelectClient: (clientId: string) => void
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

function fuzzyFindProduct(
  query: string,
  products: { id: string; name: string; sku?: string }[],
): { id: string; name: string } | null {
  const normalizedQuery = query
    .toLowerCase()
    .trim()
    .replace(/\b(le|la|les|un|une|des|de|du|d')\b/g, "")
    .replace(/\s+/g, " ")
    .trim()

  if (!normalizedQuery) return null

  console.log("[v0] Searching for product:", normalizedQuery)

  const exactMatch = products.find(
    (p) => p.name.toLowerCase() === normalizedQuery || p.sku?.toLowerCase() === normalizedQuery,
  )
  if (exactMatch) {
    console.log("[v0] Exact match found:", exactMatch.name)
    return exactMatch
  }

  const substringMatch = products.find(
    (p) => p.name.toLowerCase().includes(normalizedQuery) || normalizedQuery.includes(p.name.toLowerCase()),
  )
  if (substringMatch) {
    console.log("[v0] Substring match found:", substringMatch.name)
    return substringMatch
  }

  const queryWords = normalizedQuery.split(/\s+/)
  for (const product of products) {
    const productWords = product.name.toLowerCase().split(/\s+/)
    let matchCount = 0

    for (const queryWord of queryWords) {
      for (const productWord of productWords) {
        if (
          productWord.includes(queryWord) ||
          queryWord.includes(productWord) ||
          levenshteinDistance(queryWord, productWord) <= 2
        ) {
          matchCount++
          break
        }
      }
    }

    if (matchCount >= Math.ceil(queryWords.length / 2)) {
      console.log("[v0] Word-based match found:", product.name)
      return product
    }
  }

  let bestMatch: { id: string; name: string } | null = null
  let bestDistance = Number.POSITIVE_INFINITY

  for (const product of products) {
    const distance = levenshteinDistance(normalizedQuery, product.name.toLowerCase())
    const threshold = Math.max(2, Math.floor(Math.max(normalizedQuery.length, product.name.length) * 0.4))

    if (distance < threshold && distance < bestDistance) {
      bestDistance = distance
      bestMatch = product
    }
  }

  if (bestMatch) {
    console.log("[v0] Fuzzy match found:", bestMatch.name, "distance:", bestDistance)
  } else {
    console.log("[v0] No match found for:", normalizedQuery)
  }

  return bestMatch
}

function fuzzyFindClient(query: string, clients: { id: string; name: string }[]): { id: string; name: string } | null {
  const normalizedQuery = query
    .toLowerCase()
    .trim()
    .replace(/\b(le|la|les|un|une|des|de|du|d')\b/g, "")
    .replace(/\s+/g, " ")
    .trim()

  if (!normalizedQuery) return null

  console.log("[v0] Searching for client:", normalizedQuery)

  const exactMatch = clients.find((c) => c.name.toLowerCase() === normalizedQuery)
  if (exactMatch) {
    console.log("[v0] Exact client match found:", exactMatch.name)
    return exactMatch
  }

  const substringMatch = clients.find(
    (c) => c.name.toLowerCase().includes(normalizedQuery) || normalizedQuery.includes(c.name.toLowerCase()),
  )
  if (substringMatch) {
    console.log("[v0] Substring client match found:", substringMatch.name)
    return substringMatch
  }

  const queryWords = normalizedQuery.split(/\s+/)
  for (const client of clients) {
    const clientWords = client.name.toLowerCase().split(/\s+/)
    let matchCount = 0

    for (const queryWord of queryWords) {
      for (const clientWord of clientWords) {
        if (
          clientWord.includes(queryWord) ||
          queryWord.includes(clientWord) ||
          levenshteinDistance(queryWord, clientWord) <= 2
        ) {
          matchCount++
          break
        }
      }
    }

    if (matchCount >= Math.ceil(queryWords.length / 2)) {
      console.log("[v0] Word-based client match found:", client.name)
      return client
    }
  }

  let bestMatch: { id: string; name: string } | null = null
  let bestDistance = Number.POSITIVE_INFINITY

  for (const client of clients) {
    const distance = levenshteinDistance(normalizedQuery, client.name.toLowerCase())
    const threshold = Math.max(2, Math.floor(Math.max(normalizedQuery.length, client.name.length) * 0.4))

    if (distance < threshold && distance < bestDistance) {
      bestDistance = distance
      bestMatch = client
    }
  }

  if (bestMatch) {
    console.log("[v0] Fuzzy client match found:", bestMatch.name, "distance:", bestDistance)
  } else {
    console.log("[v0] No client match found for:", normalizedQuery)
  }

  return bestMatch
}

export function useSaleVoiceCommands(props: VoiceHookProps): VoiceHookReturn {
  const {
    products,
    clients,
    onSelectProduct,
    onSelectClient,
    onSelectPricePlan,
    onQuantity,
    onUnitPrice,
    onRequestSubmit,
  } = props

  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [statusMessage, setStatusMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pendingConfirmation, setPendingConfirmation] = useState(false)

  const recognitionRef = useRef<any>(null)
  const confirmCallbackRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      setIsSupported(!!SpeechRecognition)

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "fr-FR"
      }
    }
  }, [])

  const processCommand = useCallback(
    (text: string) => {
      const normalized = text.toLowerCase().trim()
      console.log("[v0] Processing voice command:", normalized)

      // Check for review/confirm commands first
      if (normalized.includes("réviser") || normalized.includes("vérifier") || normalized.includes("review")) {
        setPendingConfirmation(true)
        onRequestSubmit()
        setStatusMessage("Veuillez confirmer la vente")
        console.log("[v0] Review requested, pending confirmation")
        return
      }

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

      // Check for price plan keywords
      if (normalized.includes("gros") || normalized.includes("wholesale")) {
        onSelectPricePlan("gros")
        setStatusMessage("Plan de prix: Gros")
        console.log("[v0] Price plan set to: gros")
        return
      }
      if (normalized.includes("détail")) {
        if (normalized.includes("2")) {
          onSelectPricePlan("detail_2")
          setStatusMessage("Plan de prix: Détail 2")
          console.log("[v0] Price plan set to: detail_2")
        } else {
          onSelectPricePlan("detail_1")
          setStatusMessage("Plan de prix: Détail 1")
          console.log("[v0] Price plan set to: detail_1")
        }
        return
      }

      // Check for explicit quantity command
      const quantityMatch = normalized.match(/quantité\s+(\d+)/)
      if (quantityMatch) {
        const qty = Number.parseInt(quantityMatch[1], 10)
        if (!isNaN(qty) && qty > 0) {
          onQuantity(qty)
          setStatusMessage(`Quantité: ${qty}`)
          console.log("[v0] Quantity set to:", qty)
          return
        }
      }

      // Check for explicit price command
      const priceMatch =
        normalized.match(/prix\s+unitaire\s+(\d+(?:[.,]\d+)?)/) || normalized.match(/prix\s+(\d+(?:[.,]\d+)?)/)
      if (priceMatch) {
        const price = Number.parseFloat(priceMatch[1].replace(",", "."))
        if (!isNaN(price) && price > 0) {
          onUnitPrice(price)
          setStatusMessage(`Prix unitaire: ${price} FCFA`)
          console.log("[v0] Unit price set to:", price)
          return
        }
      }

      // Check for explicit client command
      if (normalized.includes("client")) {
        const clientQuery = normalized
          .replace(/client/gi, "")
          .replace(/sélectionner/gi, "")
          .replace(/sélectionnez/gi, "")
          .replace(/\b(le|la|les|un|une|des|de|du|d')\b/gi, "")
          .trim()

        console.log("[v0] Extracted client query:", clientQuery)

        const client = fuzzyFindClient(clientQuery, clients)
        if (client) {
          onSelectClient(client.id)
          setStatusMessage(`Client sélectionné: ${client.name}`)
          setError(null)
          console.log("[v0] Client selected:", client.name)
        } else {
          setError(`Client non trouvé: "${clientQuery}"`)
          console.log("[v0] Client not found:", clientQuery)
        }
        return
      }

      // Try to match as a product (most common case)
      const productQuery = normalized
        .replace(/sélectionner/gi, "")
        .replace(/sélectionnez/gi, "")
        .replace(/produit/gi, "")
        .replace(/produits/gi, "")
        .replace(/\b(le|la|les|un|une|des|de|du|d')\b/gi, "")
        .trim()

      const product = fuzzyFindProduct(productQuery, products)
      if (product) {
        onSelectProduct(product.id)
        setStatusMessage(`Produit sélectionné: ${product.name}`)
        setError(null)
        console.log("[v0] Product selected:", product.name)
        return
      }

      // Try to match as a client
      const client = fuzzyFindClient(normalized, clients)
      if (client) {
        onSelectClient(client.id)
        setStatusMessage(`Client sélectionné: ${client.name}`)
        setError(null)
        console.log("[v0] Client selected:", client.name)
        return
      }

      // Try to match as a standalone number (quantity or price)
      const numberMatch = normalized.match(/^(\d+(?:[.,]\d+)?)$/)
      if (numberMatch) {
        const num = Number.parseFloat(numberMatch[1].replace(",", "."))
        if (!isNaN(num) && num > 0) {
          // If number is small (< 100), assume it's quantity, otherwise assume it's price
          if (num < 100) {
            onQuantity(Math.floor(num))
            setStatusMessage(`Quantité: ${Math.floor(num)}`)
            console.log("[v0] Quantity set to:", Math.floor(num))
          } else {
            onUnitPrice(num)
            setStatusMessage(`Prix unitaire: ${num} FCFA`)
            console.log("[v0] Unit price set to:", num)
          }
          return
        }
      }

      // If nothing matched, show error
      setStatusMessage(
        "Commande non reconnue. Dites simplement: nom du produit, nom du client, quantité, prix, 'gros', 'détail', ou 'réviser'",
      )
      console.log("[v0] Command not recognized:", normalized)
    },
    [
      products,
      clients,
      onSelectProduct,
      onSelectClient,
      onSelectPricePlan,
      onQuantity,
      onUnitPrice,
      onRequestSubmit,
      pendingConfirmation,
    ],
  )

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
  }, [])

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
