"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Upload, AlertCircle, CheckCircle, Eye, Plus } from "lucide-react"
import { bulkCreatePurchases, previewBulkPurchases, type PreviewRow } from "@/app/purchases/actions"

interface PurchaseRow {
  product_name: string
  supplier_name: string
  quantity: number
  unit_price: number
  purchase_date?: string
  prix_vente_detail_1?: number
  prix_vente_detail_2?: number
  prix_vente_gros?: number
}

export function BulkPurchaseImport() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [preview, setPreview] = useState<PreviewRow[] | null>(null)
  const [results, setResults] = useState<{
    success: number
    errors: string[]
    created?: string[]
  } | null>(null)

  const downloadTemplate = () => {
    const csvContent = `product_name,supplier_name,quantity,unit_price,purchase_date,prix_vente_detail_1,prix_vente_detail_2,prix_vente_gros
Raggie 30AH Controller,GUANGZHOU V V SUPOWER CO,150,8364,2025-09-07,12547,11292,9500
Tele 43 VV SMART,GUANGZHOU V V SUPOWER CO,75,15200,2025-09-07,22800,21000,18500
Panneau Solaire 200W,Solar Tech Burkina,30,25000,,37500,35000,32000
Onduleur 3000W,West Africa Solar,20,45000,2025-09-07,67500,,60000`

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "template_achats_bulk.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile)
      setResults(null)
      setPreview(null)
    }
  }

  const parseCSV = (csvText: string): PurchaseRow[] => {
    const lines = csvText.trim().split("\n")
    const headers = lines[0].split(",").map((h) => h.trim())

    return lines.slice(1).map((line) => {
      const values = []
      let current = ""
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          values.push(current.trim())
          current = ""
        } else {
          current += char
        }
      }
      values.push(current.trim()) // Add the last value

      const parseNumber = (value: string): number => {
        if (!value || value === "") return 0
        const cleaned = value.replace(/[^\d.-]/g, "") // Remove non-numeric characters except . and -
        const parsed = Number.parseFloat(cleaned)
        return isNaN(parsed) ? 0 : parsed
      }

      const parseInteger = (value: string): number => {
        if (!value || value === "") return 0
        const cleaned = value.replace(/[^\d-]/g, "") // Remove non-numeric characters except -
        const parsed = Number.parseInt(cleaned, 10)
        return isNaN(parsed) ? 0 : parsed
      }

      return {
        product_name: (values[0] || "").replace(/"/g, ""), // Remove quotes
        supplier_name: (values[1] || "").replace(/"/g, ""), // Remove quotes
        quantity: parseInteger(values[2]),
        unit_price: parseNumber(values[3]),
        purchase_date: values[4] && values[4] !== "" ? values[4].replace(/"/g, "") : undefined,
        prix_vente_detail_1: values[5] ? parseNumber(values[5]) : undefined,
        prix_vente_detail_2: values[6] ? parseNumber(values[6]) : undefined,
        prix_vente_gros: values[7] ? parseNumber(values[7]) : undefined,
      }
    })
  }

  const handlePreview = async () => {
    if (!file) return

    setIsProcessing(true)
    try {
      const csvText = await file.text()
      const purchases = parseCSV(csvText)

      const result = await previewBulkPurchases(purchases)
      if (result.success) {
        setPreview(result.preview)
        setResults(null)
      } else {
        setResults({
          success: 0,
          errors: result.errors,
        })
      }
    } catch (error) {
      setResults({
        success: 0,
        errors: ["Erreur lors du traitement du fichier CSV"],
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImport = async () => {
    if (!file || !preview) return

    setIsProcessing(true)
    try {
      const csvText = await file.text()
      const purchases = parseCSV(csvText)

      const result = await bulkCreatePurchases(purchases)
      setResults(result)
      setPreview(null) // Clear preview after import
    } catch (error) {
      setResults({
        success: 0,
        errors: ["Erreur lors du traitement du fichier CSV"],
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusBadge = (status: "exists" | "will_create", type: "product" | "supplier") => {
    if (status === "exists") {
      return (
        <Badge variant="secondary" className="text-green-700 bg-green-100">
          Existe
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="text-blue-700 bg-blue-50">
        <Plus className="h-3 w-3 mr-1" />
        Créer
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Template Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Modèle CSV
          </CardTitle>
          <CardDescription>Téléchargez le modèle CSV pour formater vos données d'achat</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={downloadTemplate} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Télécharger le Modèle
          </Button>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Format requis:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                • <strong>product_name:</strong> Nom du produit (sera créé s'il n'existe pas)
              </li>
              <li>
                • <strong>supplier_name:</strong> Nom du fournisseur (sera créé s'il n'existe pas)
              </li>
              <li>
                • <strong>quantity:</strong> Quantité achetée (nombre entier)
              </li>
              <li>
                • <strong>unit_price:</strong> Prix unitaire d'achat (obligatoire)
              </li>
              <li>
                • <strong>purchase_date:</strong> Date d'achat YYYY-MM-DD (optionnel, défaut: aujourd'hui)
              </li>
              <li>
                • <strong>prix_vente_detail_1:</strong> Prix de vente détail 1 (optionnel)
              </li>
              <li>
                • <strong>prix_vente_detail_2:</strong> Prix de vente détail 2 (optionnel)
              </li>
              <li>
                • <strong>prix_vente_gros:</strong> Prix de vente en gros (optionnel)
              </li>
            </ul>
            <p className="text-xs text-gray-500 mt-2">
              Note: Les produits et fournisseurs manquants seront créés automatiquement. Chaque achat créera un lot de
              stock séparé avec traçabilité complète. Les prix de vente mettront à jour les prix du produit.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importer le Fichier CSV
          </CardTitle>
          <CardDescription>Sélectionnez votre fichier CSV formaté selon le modèle</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="csv-file">Fichier CSV</Label>
            <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} className="mt-1" />
          </div>

          {file && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Fichier sélectionné: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </AlertDescription>
            </Alert>
          )}

          {!preview ? (
            <Button onClick={handlePreview} disabled={!file || isProcessing} className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              {isProcessing ? "Vérification en cours..." : "Prévisualiser l'Import"}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleImport} disabled={isProcessing} className="flex-1">
                {isProcessing ? "Import en cours..." : "Confirmer l'Import"}
              </Button>
              <Button onClick={() => setPreview(null)} variant="outline">
                Modifier
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Table */}
      {preview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Prévisualisation de l'Import
            </CardTitle>
            <CardDescription>
              Vérifiez les données avant de confirmer l'import. Les éléments marqués "Créer" seront ajoutés
              automatiquement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ligne</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Prix Unit.</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.map((row) => (
                    <TableRow key={row.rowNumber} className={row.errors.length > 0 ? "bg-red-50" : ""}>
                      <TableCell>{row.rowNumber}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{row.product_name}</div>
                          {getStatusBadge(row.productStatus, "product")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium max-w-[200px] break-words">{row.supplier_name}</div>
                          {getStatusBadge(row.supplierStatus, "supplier")}
                        </div>
                      </TableCell>
                      <TableCell>
                        {isNaN(row.quantity) || row.quantity === 0 ? (
                          <span className="text-red-600">Invalide</span>
                        ) : (
                          row.quantity
                        )}
                      </TableCell>
                      <TableCell>
                        {isNaN(row.unit_price) || row.unit_price === 0 ? (
                          <span className="text-red-600">Invalide</span>
                        ) : (
                          `${Math.round(row.unit_price).toLocaleString()} FCFA`
                        )}
                      </TableCell>
                      <TableCell>
                        {row.errors.length > 0 ? (
                          <div className="space-y-1">
                            <Badge variant="destructive">Erreur</Badge>
                            <div className="text-xs text-red-600">
                              {row.errors.map((error, i) => (
                                <div key={i}>• {error}</div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Prêt
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Résumé:</span>
              </div>
              <div className="mt-2 text-sm text-blue-700">
                • {preview.filter((r) => r.errors.length === 0).length} lignes prêtes à importer •{" "}
                {preview.filter((r) => r.errors.length > 0).length} lignes avec erreurs •{" "}
                {preview.filter((r) => r.productStatus === "will_create").length} nouveaux produits à créer •{" "}
                {preview.filter((r) => r.supplierStatus === "will_create").length} nouveaux fournisseurs à créer
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {results.errors.length === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Résultats de l'Import
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-green-600">✅ {results.success} achats créés avec succès</p>

              {results.created && results.created.length > 0 && (
                <div>
                  <p className="text-blue-600 font-medium">🆕 Éléments créés:</p>
                  <ul className="text-sm text-blue-600 ml-4">
                    {results.created.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {results.errors.length > 0 && (
                <div>
                  <p className="text-red-600 font-medium">❌ Erreurs:</p>
                  <ul className="text-sm text-red-600 ml-4">
                    {results.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
