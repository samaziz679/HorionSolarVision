import { fetchBankAccountById } from "@/lib/data/banking"
import BankingForm from "@/components/banking/banking-form"
import { notFound } from "next/navigation"

export default async function EditBankingPage({ params }: { params: { id: string } }) {
  const id = params.id
  const account = await fetchBankAccountById(id)

  if (!account) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit Bank Account</h1>
      <BankingForm account={account} />
    </div>
  )
}
