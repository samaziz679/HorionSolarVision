import type { Metadata } from "next"
import { VoiceSalesInterface } from "@/components/voice-sales/voice-sales-interface"

export const metadata: Metadata = {
  title: "Assistant Vocal - Ventes",
  description: "Interface vocale pour les ventes en français",
}

export default function VoiceSalesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Assistant Vocal</h2>
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">Commandes vocales en français pour les ventes</p>
        </div>
      </div>
      <VoiceSalesInterface />
    </div>
  )
}
