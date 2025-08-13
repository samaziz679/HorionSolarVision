import LoginForm from "@/components/auth/login-form"
import { getTranslations } from "next-intl/server"

export default async function LoginPage() {
  const t = await getTranslations()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">{t("auth.welcomeBack")}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t("auth.signInMessage")}</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
