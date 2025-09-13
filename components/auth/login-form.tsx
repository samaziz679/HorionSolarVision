"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Mail } from "lucide-react"

export default function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false)

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const supabase = createClient()

    const { count: profileCount } = await supabase.from("user_profiles").select("*", { count: "exact", head: true })

    const isFirstUse = profileCount === 0

    if (isFirstUse) {
      console.log("[v0] First use detected - allowing admin creation for:", email)
      // Allow first user creation - skip authorization checks
      const redirectTo = new URL("/auth/callback", window.location.origin)

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo.toString(),
        },
      })

      if (signInError) {
        setError(signInError.message)
      } else {
        setIsMagicLinkSent(true)
      }
      setIsSubmitting(false)
      return
    }

    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("id, email, status")
      .eq("email", email)
      .single()

    if (profileError || !userProfile) {
      console.log("[v0] User profile not found for email:", email)
      try {
        await supabase.from("unauthorized_attempts").insert({
          user_id: null,
          attempted_resource: "login",
          user_role: null,
          ip_address: null,
          user_agent: navigator.userAgent,
        })
      } catch (logError) {
        console.error("Failed to log unauthorized attempt:", logError)
      }

      setError("Cette adresse email n'est pas autorisée à accéder au système. Contactez votre administrateur.")
      setIsSubmitting(false)
      return
    }

    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userProfile.id)
      .single()

    if (roleError || !userRole) {
      console.log("[v0] No role found for user:", userProfile.id)
      setError("Votre compte n'a pas de rôle assigné. Contactez votre administrateur.")
      setIsSubmitting(false)
      return
    }

    if (userProfile.status !== "active") {
      try {
        await supabase.from("unauthorized_attempts").insert({
          user_id: userProfile.id,
          attempted_resource: "login_inactive",
          user_role: userRole.role,
          ip_address: null,
          user_agent: navigator.userAgent,
        })
      } catch (logError) {
        console.error("Failed to log inactive account attempt:", logError)
      }

      setError("Votre compte n'est pas encore activé. Contactez votre administrateur.")
      setIsSubmitting(false)
      return
    }

    console.log("[v0] User validation successful for:", email)
    const redirectTo = new URL("/auth/callback", window.location.origin)

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo.toString(),
      },
    })

    if (signInError) {
      setError(signInError.message)
    } else {
      setIsMagicLinkSent(true)
    }
    setIsSubmitting(false)
  }

  if (isMagicLinkSent) {
    return (
      <div className="text-center">
        <Mail className="mx-auto h-12 w-12 text-green-500" />
        <h2 className="mt-4 text-xl font-semibold">Vérifiez votre email</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Un lien magique a été envoyé à votre adresse email. Cliquez sur le lien pour vous connecter.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">Connexion</h1>
        <p className="text-gray-500 dark:text-gray-400">Entrez votre email pour recevoir un lien magique.</p>
      </div>
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="vous@exemple.com" required disabled={isSubmitting} />
        </div>
        {error && (
          <div className="flex items-center gap-x-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Envoi du lien magique..." : "Envoyer le lien magique"}
        </Button>
      </form>
    </div>
  )
}
