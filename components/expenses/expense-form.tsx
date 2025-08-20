"use client"

import type React from "react"
import { useState } from "react"
import { Loader2, Plus } from "lucide-react"
import { createExpense, updateExpense } from "@/app/expenses/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { Expense } from "@/lib/supabase/types"
import type { ExpenseCategory } from "@/lib/data/categories"
import { createClient } from "@/lib/supabase/client"

interface ExpenseFormProps {
  expense?: Expense
  categories: ExpenseCategory[]
}

export default function ExpenseForm({ expense, categories: initialCategories }: ExpenseFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<ExpenseCategory[]>(initialCategories)
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    const formData = new FormData(event.currentTarget)

    if (expense) {
      await updateExpense(expense.id, { success: false }, formData)
    } else {
      await createExpense({ success: false }, formData)
    }
    setIsLoading(false)
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return

    setIsAddingCategory(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from("expense_categories")
      .insert([
        {
          name_fr: newCategoryName.trim(),
          name_en: newCategoryName.trim(),
          is_default: false,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating category:", error)
    } else {
      setCategories((prev) => [...prev, data])
      setNewCategoryName("")
      setShowAddDialog(false)
    }

    setIsAddingCategory(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          defaultValue={expense?.description || ""}
          placeholder="Entrez la description de la dépense"
          required
        />
      </div>

      <div>
        <Label htmlFor="category">Catégorie</Label>
        <div className="flex gap-2">
          <Select name="category" defaultValue={expense?.category_id || ""} required>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name_fr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter une nouvelle catégorie</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="new-category">Nom de la catégorie</Label>
                  <Input
                    id="new-category"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Entrez le nom de la catégorie"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={isAddingCategory || !newCategoryName.trim()}
                    className="flex-1"
                  >
                    {isAddingCategory && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isAddingCategory ? "Ajout..." : "Ajouter"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddDialog(false)
                      setNewCategoryName("")
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div>
        <Label htmlFor="amount">Montant</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0"
          defaultValue={expense?.amount || ""}
          placeholder="0.00"
          required
        />
      </div>

      <div>
        <Label htmlFor="expense_date">Date de Dépense</Label>
        <Input
          id="expense_date"
          name="expense_date"
          type="date"
          defaultValue={expense?.expense_date || new Date().toISOString().split("T")[0]}
          required
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes (Optionnelles)</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={expense?.notes || ""}
          placeholder="Notes supplémentaires sur cette dépense"
          rows={3}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading
          ? expense
            ? "Mise à jour..."
            : "Création..."
          : expense
            ? "Mettre à jour la Dépense"
            : "Créer une Dépense"}
      </Button>
    </form>
  )
}
