"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Link2, Unlink, CheckCircle2, AlertCircle } from "lucide-react"
import { linkBankEntryToSale, unlinkBankEntryFromSale } from "@/app/bank/reconciliation/actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { BankEntry, BankEntryWithSale } from "@/lib/data/bank-entries"

interface ReconciliationClientProps {
  unreconciledSales: Array<{
    id: string
    sale_date: string
    total: number
    client_name: string
  }>
  unreconciledBankInflows: BankEntry[]
  reconciledEntries: BankEntryWithSale[]
}

export function ReconciliationClient({
  unreconciledSales,
  unreconciledBankInflows,
  reconciledEntries,
}: ReconciliationClientProps) {
  const router = useRouter()
  const [selectedSale, setSelectedSale] = useState<string | null>(null)
  const [selectedBankEntry, setSelectedBankEntry] = useState<string | null>(null)
  const [isLinking, setIsLinking] = useState(false)

  const handleLink = async () => {
    if (!selectedSale || !selectedBankEntry) {
      toast.error("Please select both a sale and a bank entry to link")
      return
    }

    setIsLinking(true)
    const result = await linkBankEntryToSale(selectedBankEntry, selectedSale)

    if (result.success) {
      toast.success(result.message)
      setSelectedSale(null)
      setSelectedBankEntry(null)
      router.refresh()
    } else {
      toast.error(result.message)
    }
    setIsLinking(false)
  }

  const handleUnlink = async (bankEntryId: string) => {
    const result = await unlinkBankEntryFromSale(bankEntryId)

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

  const totalUnreconciledSales = unreconciledSales.reduce((sum, sale) => sum + sale.total, 0)
  const totalUnreconciledInflows = unreconciledBankInflows.reduce((sum, entry) => sum + entry.amount, 0)
  const difference = totalUnreconciledInflows - totalUnreconciledSales

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unreconciled Sales</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalUnreconciledSales)}</div>
            <p className="text-xs text-muted-foreground">{unreconciledSales.length} sales pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unreconciled Inflows</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalUnreconciledInflows)}</div>
            <p className="text-xs text-muted-foreground">{unreconciledBankInflows.length} deposits pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Difference</CardTitle>
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
              {difference === 0 ? "Balanced" : difference > 0 ? "Excess inflows" : "Missing deposits"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="unreconciled" className="space-y-4">
        <TabsList>
          <TabsTrigger value="unreconciled">
            Unreconciled <Badge className="ml-2">{unreconciledSales.length + unreconciledBankInflows.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="reconciled">
            Reconciled <Badge className="ml-2">{reconciledEntries.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unreconciled" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Unreconciled Sales */}
            <Card>
              <CardHeader>
                <CardTitle>Unreconciled Sales</CardTitle>
                <CardDescription>Sales that haven't been linked to bank deposits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {unreconciledSales.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No unreconciled sales</p>
                  ) : (
                    unreconciledSales.map((sale) => (
                      <div
                        key={sale.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedSale === sale.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                        }`}
                        onClick={() => setSelectedSale(sale.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{sale.client_name}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(sale.sale_date)}</p>
                          </div>
                          <p className="font-semibold">{formatCurrency(sale.total)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Unreconciled Bank Inflows */}
            <Card>
              <CardHeader>
                <CardTitle>Unreconciled Bank Inflows</CardTitle>
                <CardDescription>Bank deposits that haven't been linked to sales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {unreconciledBankInflows.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No unreconciled bank inflows</p>
                  ) : (
                    unreconciledBankInflows.map((entry) => (
                      <div
                        key={entry.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedBankEntry === entry.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                        }`}
                        onClick={() => setSelectedBankEntry(entry.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{entry.description}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(entry.entry_date)}</p>
                          </div>
                          <p className="font-semibold">{formatCurrency(entry.amount)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Link Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleLink}
              disabled={!selectedSale || !selectedBankEntry || isLinking}
              className="gap-2"
            >
              <Link2 className="h-4 w-4" />
              {isLinking ? "Linking..." : "Link Selected Items"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="reconciled">
          <Card>
            <CardHeader>
              <CardTitle>Reconciled Entries</CardTitle>
              <CardDescription>Bank deposits that have been linked to sales</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bank Entry</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Linked Sale</TableHead>
                    <TableHead>Sale Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reconciledEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No reconciled entries yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    reconciledEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.description}</TableCell>
                        <TableCell>{formatDate(entry.entry_date)}</TableCell>
                        <TableCell>{formatCurrency(entry.amount)}</TableCell>
                        <TableCell>
                          {entry.sales ? <Badge variant="outline">{formatCurrency(entry.sales.total)}</Badge> : "N/A"}
                        </TableCell>
                        <TableCell>{entry.sales ? formatDate(entry.sales.sale_date) : "N/A"}</TableCell>
                        <TableCell>{entry.sales?.clients?.name || "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleUnlink(entry.id)} className="gap-2">
                            <Unlink className="h-3 w-3" />
                            Unlink
                          </Button>
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
