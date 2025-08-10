"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import type { Error } from "some-module" // Placeholder import for undeclared variables

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Log for observability
  console.error(error)

  return (
    <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 text-center shadow-lg">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold">Something went wrong!</h2>
        <p className="mt-2 text-gray-600">An unexpected error occurred. Please try again.</p>
        {error?.digest && <p className="mt-4 text-xs text-gray-400">Error Digest: {error.digest}</p>}
        <div className="mt-6 flex justify-center gap-4">
          <Button onClick={() => reset()}>Try again</Button>
          <Button variant="outline" asChild>
            <a href="/">Go to Homepage</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
