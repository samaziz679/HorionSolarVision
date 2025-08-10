import { fetchBankAccounts } from "@/lib/data/banking"
import BankAccountList from "@/components/banking/banking-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export default async function BankingPage() {
  const bankAccounts = await fetchBankAccounts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Bank Accounts</h1>
        <Button asChild>
          <Link href="/banking/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Bank Account
          </Link>
        </Button>
      </div>
      <BankAccountList bankAccounts={bankAccounts} />
    </div>
  )
}
