import "server-only"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import type { CookieOptions } from "@supabase/ssr"

export function createClient() {
  const cookieStore = cookies()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }

  // Universal cookies adapter: supports both get/set/remove and getAll/setAll shapes.
  const cookieAdapter = {
    // Used by some @supabase/ssr versions
    get(name: string) {
      return cookieStore.get(name)?.value
    },
    set(_name: string, _value: string, _options?: CookieOptions) {
      // no-op in RSC/SSR page render; only set cookies in Route Handlers/Server Actions
    },
    remove(_name: string, _options?: CookieOptions) {
      // no-op in RSC/SSR
    },
    // Official API for @supabase/ssr
    getAll() {
      return cookieStore.getAll().map((c) => ({ name: c.name, value: c.value }))
    },
    setAll(_cookies: { name: string; value: string; options?: CookieOptions }[]) {
      // no-op during RSC/SSR
    },
  }

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: cookieAdapter as any,
  })
}
