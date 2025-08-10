"use client"
import { createClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Make the user prop optional to avoid type errors when no user is passed.
type User = {
  email?: string | null
  user_metadata?: {
    name?: string | null
    avatar_url?: string | null
  } | null
}

type Props = {
  user?: User | null
}

// Create a browser Supabase client using NEXT_PUBLIC env vars.
// These are available on the client and are already present in your project.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
)

async function handleSignOut() {
  try {
    await supabase.auth.signOut()
  } finally {
    // Redirect to login (or home) after signing out.
    window.location.href = "/login"
  }
}

export default function UserButton({ user }: Props) {
  // If user isn't available, show a Sign in button.
  if (!user) {
    return (
      <Button asChild size="sm" variant="default">
        <a href="/login">Sign in</a>
      </Button>
    )
  }

  const name = (user.user_metadata?.name?.trim() || undefined) ?? (user.email || undefined) ?? "User"
  const avatarUrl = user.user_metadata?.avatar_url || undefined
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 px-2 gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt="Profile" />
            <AvatarFallback>{initials || "U"}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm">{name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/dashboard">Dashboard</a>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
