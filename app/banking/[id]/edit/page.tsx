import { notFound } from "next/navigation"
import { fetchBankAccountById } from "@/lib/data/banking"
import BankingForm from "@/components/banking/banking-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type PageProps = {
  params: {
    id: string
  }
}

export default async function EditBankingPage({ params }: PageProps) {
  const { id } = params
  const bankAccount = await fetchBankAccountById(id)

  if (!bankAccount) {
    notFound()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Bank Account</CardTitle>
      </CardHeader>
      <CardContent>
        <BankingForm bankAccount={bankAccount} />
      </CardContent>
    </Card>
  )
}
