"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Mail, Clock } from "lucide-react"

const getOriginUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
}

export default function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false)
  const [isPendingUser, setIsPendingUser] = useState(false)

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setIsPendingUser(false)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const supabase = createClient()

    console.log("[v0] Checking if this is first use...")

    const { count: profileCount, error: countError } = await supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true })

    console.log("[v0] Profile count result:", { profileCount, countError })

    const isFirstUse = profileCount === 0 || profileCount === null

    if (isFirstUse) {
      console.log("[v0] First use detected - allowing admin creation for:", email)
      // Allow first user creation - skip authorization checks
      const redirectTo =
        process.env.NODE_ENV === "production"
          ? `${getOriginUrl()}/auth/callback`
          : process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${getOriginUrl()}/auth/callback`

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
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

    console.log("[v0] Not first use, checking user authorization...")

    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (!authError && authUsers) {
      const existingAuthUser = authUsers.users.find((user) => user.email === email)

      if (existingAuthUser) {
        // User exists in auth but check if they have a profile
        const { data: userProfile, error: profileError } = await supabase
          .from("user_profiles")
          .select("id, email, status")
          .eq("user_id", existingAuthUser.id)
          .single()

        if (profileError || !userProfile) {
          console.log("[v0] User exists in auth but no profile found - pending activation")
          setIsPendingUser(true)
          setError(
            "Votre compte est en attente d'activation. Un administrateur doit approuver votre accès avant que vous puissiez vous connecter.",
          )
          setIsSubmitting(false)
          return
        }
      }
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

      if (userProfile.status === "pending") {
        setIsPendingUser(true)
        setError("Votre compte est en attente d'activation par un administrateur.")
      } else {
        setError("Votre compte n'est pas encore activé. Contactez votre administrateur.")
      }
      setIsSubmitting(false)
      return
    }

    console.log("[v0] User validation successful for:", email)
    const redirectTo =
      process.env.NODE_ENV === "production"
        ? `${getOriginUrl()}/auth/callback`
        : process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${getOriginUrl()}/auth/callback`

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
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
          <div
            className={`flex items-center gap-x-2 rounded-md border p-3 text-sm ${
              isPendingUser ? "border-orange-200 bg-orange-50 text-orange-600" : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {isPendingUser ? (
              <Clock className="h-4 w-4 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            )}
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
