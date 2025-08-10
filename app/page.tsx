import { redirect } from "next/navigation"

export default function HomePage() {
  // The middleware handles auth redirection, so this page can simply
  // redirect to the main dashboard.
  redirect("/dashboard")
}
