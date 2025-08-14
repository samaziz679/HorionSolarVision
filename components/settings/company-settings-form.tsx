"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Save, ImageIcon } from "lucide-react"
import { companyConfig } from "@/lib/config/company"
import { updateCompanySettings } from "@/app/settings/actions"
import { useToast } from "@/hooks/use-toast"

export function CompanySettingsForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(companyConfig.logo)
  const { toast } = useToast()

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    try {
      const result = await updateCompanySettings(formData)
      if (result.success) {
        toast({
          title: "Paramètres mis à jour",
          description: "Les informations de votre entreprise ont été mises à jour avec succès.",
        })
        // Reload the page to reflect changes
        window.location.reload()
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Une erreur est survenue lors de la mise à jour.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Company Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Logo de l'entreprise
            </CardTitle>
            <CardDescription>Téléchargez le logo de votre entreprise (PNG, JPG, SVG)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              {logoPreview ? (
                <div className="relative">
                  <img
                    src={logoPreview || "/placeholder.svg"}
                    alt="Logo preview"
                    className="h-20 w-20 object-contain rounded-lg border"
                  />
                </div>
              ) : (
                <div className="h-20 w-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div>
                <Label htmlFor="logo" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-solar-orange text-white rounded-md hover:bg-solar-orange/90 transition-colors">
                    <Upload className="h-4 w-4" />
                    Choisir un logo
                  </div>
                </Label>
                <Input
                  id="logo"
                  name="logo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
            <CardDescription>Détails de base de votre entreprise</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nom de l'entreprise</Label>
              <Input
                id="name"
                name="name"
                defaultValue={companyConfig.name}
                placeholder="Nom de votre entreprise"
                required
              />
            </div>
            <div>
              <Label htmlFor="tagline">Slogan</Label>
              <Input
                id="tagline"
                name="tagline"
                defaultValue={companyConfig.tagline}
                placeholder="Slogan de votre entreprise"
              />
            </div>
            <div>
              <Label htmlFor="currency">Devise</Label>
              <Input id="currency" name="currency" defaultValue={companyConfig.currency} placeholder="FCFA" required />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de contact</CardTitle>
          <CardDescription>Coordonnées de votre entreprise</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={companyConfig.contact.email}
              placeholder="contact@votre-entreprise.com"
            />
          </div>
          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" name="phone" defaultValue={companyConfig.contact.phone} placeholder="+226 XX XX XX XX" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="address">Adresse</Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={companyConfig.contact.address}
              placeholder="Adresse complète de votre entreprise"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} className="bg-solar-orange hover:bg-solar-orange/90">
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </div>
    </form>
  )
}
