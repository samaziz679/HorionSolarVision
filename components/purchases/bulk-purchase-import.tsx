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
  purchase_date: string
}

export function BulkPurchaseImport() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<{
    success: number
    errors: string[]
  } | null>(null)

  const downloadTemplate = () => {
    const csvContent = `product_name,supplier_name,quantity,unit_price,purchase_date
15000AH BELTA,Fournisseur Solar,50,8092,2025-09-02
2000W Inverter,Fournisseur Tech,25,3349,2025-09-02
Panneau Solaire de 150W/200W,Fournisseur Solar,30,22438,2025-09-02`

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
        purchase_date: values[4],
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
                • <strong>product_name:</strong> Nom exact du produit (doit exister)
              </li>
              <li>
                • <strong>supplier_name:</strong> Nom exact du fournisseur (doit exister)
              </li>
              <li>
                • <strong>quantity:</strong> Quantité (nombre entier)
              </li>
              <li>
                • <strong>unit_price:</strong> Prix unitaire (nombre décimal)
              </li>
              <li>
                • <strong>purchase_date:</strong> Date (format: YYYY-MM-DD)
              </li>
            </ul>
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
