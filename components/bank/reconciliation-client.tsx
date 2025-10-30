"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Link2, Unlink, CheckCircle2, AlertCircle, X } from "lucide-react"
import { linkSalesToBankEntry, unlinkSaleFromBankEntry } from "@/app/bank/reconciliation/actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { BankEntryWithSales } from "@/lib/data/bank-entries"

interface ReconciliationClientProps {
  unreconciledSales: Array<{
    id: string
    sale_date: string
    total: number
    client_name: string
    reconciled_amount?: number
  }>
  unreconciledBankInflows: BankEntryWithSales[]
  reconciledEntries: BankEntryWithSales[]
}

export function ReconciliationClient({
  unreconciledSales,
  unreconciledBankInflows,
  reconciledEntries,
}: ReconciliationClientProps) {
  const router = useRouter()
  const [selectedSales, setSelectedSales] = useState<Map<string, number>>(new Map())
  const [selectedBankEntry, setSelectedBankEntry] = useState<string | null>(null)
  const [isLinking, setIsLinking] = useState(false)

  const handleSaleClick = (saleId: string, saleTotal: number, reconciledAmount = 0) => {
    const newSelected = new Map(selectedSales)
    if (newSelected.has(saleId)) {
      newSelected.delete(saleId)
    } else {
      // Default to remaining amount
      const remainingAmount = saleTotal - reconciledAmount
      newSelected.set(saleId, remainingAmount)
    }
    setSelectedSales(newSelected)
  }

  const handleAmountChange = (saleId: string, amount: string) => {
    const numAmount = Number.parseFloat(amount) || 0
    const newSelected = new Map(selectedSales)
    if (numAmount > 0) {
      newSelected.set(saleId, numAmount)
    } else {
      newSelected.delete(saleId)
    }
    setSelectedSales(newSelected)
  }

  const handleLink = async () => {
    if (selectedSales.size === 0 || !selectedBankEntry) {
      toast.error("Please select at least one sale and a bank entry to link")
      return
    }

    setIsLinking(true)
    const salesData = Array.from(selectedSales.entries()).map(([saleId, amount]) => ({
      saleId,
      amount,
    }))

    const result = await linkSalesToBankEntry(selectedBankEntry, salesData)

    if (result.success) {
      toast.success(result.message)
      setSelectedSales(new Map())
      setSelectedBankEntry(null)
      router.refresh()
    } else {
      toast.error(result.message)
    }
    setIsLinking(false)
  }

  const handleUnlink = async (reconciliationId: string) => {
    const result = await unlinkSaleFromBankEntry(reconciliationId)

    if (result.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR")
  }

  const totalUnreconciledSales = unreconciledSales.reduce(
    (sum, sale) => sum + (sale.total - (sale.reconciled_amount || 0)),
    0,
  )
  const totalUnreconciledInflows = unreconciledBankInflows.reduce(
    (sum, entry) => sum + (entry.amount - (entry.total_reconciled || 0)),
    0,
  )
  const difference = totalUnreconciledInflows - totalUnreconciledSales

  const selectedTotal = Array.from(selectedSales.values()).reduce((sum, amount) => sum + amount, 0)
  const selectedBankEntryData = unreconciledBankInflows.find((e) => e.id === selectedBankEntry)
  const bankEntryRemaining = selectedBankEntryData
    ? selectedBankEntryData.amount - (selectedBankEntryData.total_reconciled || 0)
    : 0
  const reconciliationDifference = bankEntryRemaining - selectedTotal

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventes Non Rapprochées</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalUnreconciledSales)}</div>
            <p className="text-xs text-muted-foreground">{unreconciledSales.length} ventes en attente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrées Non Rapprochées</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalUnreconciledInflows)}</div>
            <p className="text-xs text-muted-foreground">{unreconciledBankInflows.length} dépôts en attente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Différence</CardTitle>
            {difference === 0 ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${difference === 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(Math.abs(difference))}
            </div>
            <p className="text-xs text-muted-foreground">
              {difference === 0 ? "Équilibré" : difference > 0 ? "Excédent d'entrées" : "Dépôts manquants"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="unreconciled" className="space-y-4">
        <TabsList>
          <TabsTrigger value="unreconciled">
            Non Rapproché <Badge className="ml-2">{unreconciledSales.length + unreconciledBankInflows.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="reconciled">
            Rapproché <Badge className="ml-2">{reconciledEntries.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unreconciled" className="space-y-4">
          {(selectedSales.size > 0 || selectedBankEntry) && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-lg">Rapprochement en Cours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium mb-2">Ventes Sélectionnées ({selectedSales.size})</p>
                    <div className="space-y-1">
                      {Array.from(selectedSales.entries()).map(([saleId, amount]) => {
                        const sale = unreconciledSales.find((s) => s.id === saleId)
                        return (
                          <div key={saleId} className="flex items-center justify-between text-sm">
                            <span className="truncate">{sale?.client_name}</span>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={amount}
                                onChange={(e) => handleAmountChange(saleId, e.target.value)}
                                className="w-32 h-7 text-xs"
                                step="0.01"
                                min="0"
                                max={sale ? sale.total - (sale.reconciled_amount || 0) : 0}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSaleClick(saleId, 0)}
                                className="h-7 w-7 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <p className="text-sm font-semibold mt-2">Total: {formatCurrency(selectedTotal)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Entrée Bancaire</p>
                    {selectedBankEntryData && (
                      <div className="space-y-1 text-sm">
                        <p>{selectedBankEntryData.description}</p>
                        <p className="text-muted-foreground">{formatDate(selectedBankEntryData.entry_date)}</p>
                        <p>Montant: {formatCurrency(selectedBankEntryData.amount)}</p>
                        <p>Déjà rapproché: {formatCurrency(selectedBankEntryData.total_reconciled || 0)}</p>
                        <p className="font-semibold">Restant: {formatCurrency(bankEntryRemaining)}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-sm font-medium">
                      Différence:{" "}
                      <span
                        className={
                          reconciliationDifference === 0
                            ? "text-green-600"
                            : reconciliationDifference > 0
                              ? "text-orange-600"
                              : "text-red-600"
                        }
                      >
                        {formatCurrency(Math.abs(reconciliationDifference))}
                      </span>
                    </p>
                    {reconciliationDifference !== 0 && (
                      <p className="text-xs text-muted-foreground">
                        {reconciliationDifference > 0
                          ? "Il reste du montant à rapprocher"
                          : "Le total dépasse le montant disponible"}
                      </p>
                    )}
                  </div>
                  <Button onClick={handleLink} disabled={isLinking || reconciliationDifference < 0} className="gap-2">
                    <Link2 className="h-4 w-4" />
                    {isLinking ? "Rapprochement..." : "Rapprocher"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Unreconciled Sales */}
            <Card>
              <CardHeader>
                <CardTitle>Ventes Non Rapprochées</CardTitle>
                <CardDescription>Ventes qui n'ont pas été liées aux dépôts bancaires</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {unreconciledSales.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Aucune vente non rapprochée</p>
                  ) : (
                    unreconciledSales.map((sale) => {
                      const remainingAmount = sale.total - (sale.reconciled_amount || 0)
                      const isSelected = selectedSales.has(sale.id)
                      return (
                        <div
                          key={sale.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                          }`}
                          onClick={() => handleSaleClick(sale.id, sale.total, sale.reconciled_amount)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium">{sale.client_name}</p>
                              <p className="text-sm text-muted-foreground">{formatDate(sale.sale_date)}</p>
                              {sale.reconciled_amount && sale.reconciled_amount > 0 && (
                                <p className="text-xs text-orange-600 mt-1">
                                  Partiellement rapproché: {formatCurrency(sale.reconciled_amount)}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(sale.total)}</p>
                              {sale.reconciled_amount && sale.reconciled_amount > 0 && (
                                <p className="text-sm text-muted-foreground">
                                  Restant: {formatCurrency(remainingAmount)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Unreconciled Bank Inflows */}
            <Card>
              <CardHeader>
                <CardTitle>Entrées Bancaires Non Rapprochées</CardTitle>
                <CardDescription>Dépôts bancaires qui n'ont pas été liés aux ventes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {unreconciledBankInflows.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Aucune entrée bancaire non rapprochée
                    </p>
                  ) : (
                    unreconciledBankInflows.map((entry) => {
                      const remainingAmount = entry.amount - (entry.total_reconciled || 0)
                      const isSelected = selectedBankEntry === entry.id
                      return (
                        <div
                          key={entry.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                          }`}
                          onClick={() => setSelectedBankEntry(entry.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium">{entry.description}</p>
                              <p className="text-sm text-muted-foreground">{formatDate(entry.entry_date)}</p>
                              {entry.total_reconciled && entry.total_reconciled > 0 && (
                                <p className="text-xs text-orange-600 mt-1">
                                  Partiellement rapproché: {formatCurrency(entry.total_reconciled)}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(entry.amount)}</p>
                              {entry.total_reconciled && entry.total_reconciled > 0 && (
                                <p className="text-sm text-muted-foreground">
                                  Restant: {formatCurrency(remainingAmount)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reconciled">
          <Card>
            <CardHeader>
              <CardTitle>Entrées Rapprochées</CardTitle>
              <CardDescription>Dépôts bancaires qui ont été liés aux ventes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entrée Bancaire</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Ventes Liées</TableHead>
                    <TableHead>Total Rapproché</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reconciledEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Aucune entrée rapprochée pour le moment
                      </TableCell>
                    </TableRow>
                  ) : (
                    reconciledEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.description}</TableCell>
                        <TableCell>{formatDate(entry.entry_date)}</TableCell>
                        <TableCell>{formatCurrency(entry.amount)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {entry.reconciliations?.map((rec: any) => (
                              <div key={rec.id} className="flex items-center justify-between gap-2">
                                <span className="text-sm">{rec.sales?.clients?.name || "N/A"}</span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{formatCurrency(rec.reconciled_amount)}</Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUnlink(rec.id)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Unlink className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={entry.total_reconciled === entry.amount ? "default" : "secondary"}>
                            {formatCurrency(entry.total_reconciled || 0)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.total_reconciled !== entry.amount && (
                            <Badge variant="outline" className="text-orange-600">
                              Partiel
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
