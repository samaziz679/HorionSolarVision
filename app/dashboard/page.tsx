import { redirect } from "next/navigation"

// Redirect old dashboard route to new locale-based route
export default function DashboardRedirect() {
  redirect("/en/dashboard")
}
