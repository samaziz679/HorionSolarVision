"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Upload, AlertCircle, CheckCircle } from "lucide-react"
import { bulkCreatePurchases } from "@/app/purchases/actions"

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
  const [results, setResults] = useState<{
    success: number
    errors: string[]
  } | null>(null)

  const downloadTemplate = () => {
    const csvContent = `product_name,supplier_name,quantity,unit_price,purchase_date,prix_vente_detail_1,prix_vente_detail_2,prix_vente_gros
15000AH BELTA,West Africa Solar,50,8092,2025-09-02,10000,10500,9000
2000W Inverter,Burkina Energy Supply,25,3349,2025-09-02,5300,5500,4500
Panneau Solaire 150W,Solar Tech Import,30,22438,2025-09-02,33656,,30291
2000AH USB,GUANGZHOU V V SUPO,40,93550,,125000,135000,120000`

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
    }
  }

  const parseCSV = (csvText: string): PurchaseRow[] => {
    const lines = csvText.trim().split("\n")
    const headers = lines[0].split(",").map((h) => h.trim())

    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim())
      return {
        product_name: values[0],
        supplier_name: values[1],
        quantity: Number.parseInt(values[2]),
        unit_price: Number.parseFloat(values[3]),
        purchase_date: values[4] || undefined,
        prix_vente_detail_1: values[5] ? Number.parseFloat(values[5]) : undefined,
        prix_vente_detail_2: values[6] ? Number.parseFloat(values[6]) : undefined,
        prix_vente_gros: values[7] ? Number.parseFloat(values[7]) : undefined,
      }
    })
  }

  const handleImport = async () => {
    if (!file) return

    setIsProcessing(true)
    try {
      const csvText = await file.text()
      const purchases = parseCSV(csvText)

      const result = await bulkCreatePurchases(purchases)
      setResults(result)
    } catch (error) {
      setResults({
        success: 0,
        errors: ["Erreur lors du traitement du fichier CSV"],
      })
    } finally {
      setIsProcessing(false)
    }
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
                • <strong>product_name:</strong> Nom exact du produit (doit exister dans l'inventaire)
              </li>
              <li>
                • <strong>supplier_name:</strong> Nom exact du fournisseur (doit exister)
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
              Note: Les produits et fournisseurs doivent exister dans le système. Chaque achat créera un lot de stock
              séparé. Les prix de vente sont optionnels et mettront à jour les prix du produit si fournis.
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

          <Button onClick={handleImport} disabled={!file || isProcessing} className="w-full">
            {isProcessing ? "Traitement en cours..." : "Importer les Achats"}
          </Button>
        </CardContent>
      </Card>

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
