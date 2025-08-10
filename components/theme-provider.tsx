"use client"

import type * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

// Some versions of next-themes don't type `children` on ThemeProviderProps.
// Extend it explicitly so TS accepts children in <ThemeProvider>...</ThemeProvider>.
type ThemeProviderWithChildren = React.PropsWithChildren<ThemeProviderProps>

export function ThemeProvider({ children, ...props }: ThemeProviderWithChildren) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
