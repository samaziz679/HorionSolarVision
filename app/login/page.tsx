import { redirect } from 'next/navigation'
import LoginForm from '@/components/auth/login-form'
import { createClient } from '@/lib/supabase/server'

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { redirectedFrom?: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  const redirectedFrom = searchParams?.redirectedFrom ?? '/dashboard'

  return (
    <main className="min-h-[80vh] flex items-center justify-center p-4">
      <LoginForm redirectedFrom={redirectedFrom} />
    </main>
  )
}
