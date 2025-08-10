import LoginForm from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Welcome Back</h1>
          <p className="text-gray-500 dark:text-gray-400">Sign in to access your Solar Vision ERP</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
