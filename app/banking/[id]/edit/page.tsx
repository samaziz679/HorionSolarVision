import { fetchBankAccountById } from "@/lib/data/banking"
import BankAccountForm from "@/components/banking/banking-form"
import { notFound } from "next/navigation"

export default async function EditBankAccountPage({ params }: { params: { id: string } }) {
  const id = params.id
  const account = await fetchBankAccountById(id)

  if (!account) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit Bank Account</h1>
      <BankAccountForm account={account} />
    </div>
  )
}
