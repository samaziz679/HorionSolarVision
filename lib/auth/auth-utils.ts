import { getAuthUser } from "@/lib/auth"

export async function requireAuth() {
  return await getAuthUser()
}
