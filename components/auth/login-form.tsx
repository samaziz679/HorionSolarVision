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

    const redirectTo = new URL("/auth/callback", window.location.origin)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo.toString(),
      },
    })

    if (error) {
      setError(error.message)
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
