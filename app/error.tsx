"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Log for observability (visible in browser console; server logs already capture stack)
  // eslint-disable-next-line no-console
  console.error("Global error boundary:", error)

  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="max-w-md w-full border rounded-lg p-6 shadow-sm text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">Something went wrong</span>
          </div>
          <p className="text-sm text-muted-foreground">
            The page encountered an unexpected error. You can try again or go back.
          </p>
          {error?.digest && <p className="text-xs text-gray-500">Digest: {error.digest}</p>}
          <div className="flex items-center justify-center gap-3">
            <Button onClick={() => reset()}>Try again</Button>
            <a href="/" className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm">
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
