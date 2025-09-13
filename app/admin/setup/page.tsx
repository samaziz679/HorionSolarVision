"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, User } from "lucide-react"

export default function AdminSetupPage() {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    checkUserStatus()
  }, [])

  const checkUserStatus = async () => {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setMessage("Vous devez être connecté pour accéder à cette page")
      return
    }

    setUser(user)

    // Check if profile exists
    const { data: profile } = await supabase.from("user_roles").select("*").eq("user_id", user.id).single()

    setProfile(profile)

    if (profile) {
      setFullName(profile.full_name || "")
      if (profile.role === "admin") {
        setMessage("Vous êtes déjà administrateur. Vous pouvez accéder à la gestion des utilisateurs.")
      }
    }
  }

  const createAdminProfile = async () => {
    if (!user) return

    setLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("user_roles").upsert({
        user_id: user.id,
        email: user.email,
        full_name: fullName || "Administrateur",
        role: "admin",
        status: "active",
      })

      if (error) throw error

      setMessage("Profil administrateur créé avec succès!")
      setTimeout(() => {
        window.location.href = "/admin/users"
      }, 2000)
    } catch (error: any) {
      setMessage(`Erreur: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-12 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <Shield className="mx-auto h-12 w-12 text-orange-500 mb-4" />
          <CardTitle>Configuration Administrateur</CardTitle>
          <CardDescription>Configurez votre profil administrateur pour accéder au système</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <div className="space-y-2">
              <Label>Email connecté</Label>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm">{user.email}</span>
              </div>
            </div>
          )}

          {!profile && user && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName">Nom complet</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Votre nom complet"
                />
              </div>

              <Button onClick={createAdminProfile} disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer Profil Administrateur
              </Button>
            </>
          )}

          {profile?.role === "admin" && (
            <Button onClick={() => (window.location.href = "/admin/users")} className="w-full">
              Accéder à la Gestion des Utilisateurs
            </Button>
          )}

          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
