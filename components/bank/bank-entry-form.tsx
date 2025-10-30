"use client"

import { useFormState } from "react-dom"
import { createBankEntry, updateBankEntry } from "@/app/bank/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { BankEntry } from "@/lib/data/bank-entries"

interface BankEntryFormProps {
  entry?: BankEntry
}

export function BankEntryForm({ entry }: BankEntryFormProps) {
  const initialState = { message: null, errors: {}, success: false }
  const [state, dispatch] = useFormState(entry ? updateBankEntry.bind(null, entry.id) : createBankEntry, initialState)

  const today = new Date().toISOString().split("T")[0]

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{entry ? "Modifier l'entrée" : "Nouvelle entrée bancaire"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={dispatch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account_type">Type *</Label>
            <Select name="account_type" defaultValue={entry?.account_type || "in"}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Entrée (In)</SelectItem>
                <SelectItem value="out">Sortie (Out)</SelectItem>
              </SelectContent>
            </Select>
            {state.errors?.account_type && <p className="text-sm text-destructive">{state.errors.account_type[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              name="description"
              placeholder="Ex: Vente de produits, Paiement fournisseur..."
              defaultValue={entry?.description}
              required
            />
            {state.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Montant (FCFA) *</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              defaultValue={entry?.amount}
              required
            />
            {state.errors?.amount && <p className="text-sm text-destructive">{state.errors.amount[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="entry_date">Date *</Label>
            <Input
              id="entry_date"
              name="entry_date"
              type="date"
              defaultValue={entry?.entry_date?.split("T")[0] || today}
              required
            />
            {state.errors?.entry_date && <p className="text-sm text-destructive">{state.errors.entry_date[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Notes additionnelles..."
              defaultValue={entry?.notes || ""}
              rows={3}
            />
            {state.errors?.notes && <p className="text-sm text-destructive">{state.errors.notes[0]}</p>}
          </div>

          {state.message && !state.success && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{state.message}</div>
          )}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              {entry ? "Mettre à jour" : "Créer"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <a href="/bank">Annuler</a>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
