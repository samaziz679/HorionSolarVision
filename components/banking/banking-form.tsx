import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createBankingAccount, updateBankingAccount } from "@/app/banking/actions"
import type { BankingAccount } from "@/lib/supabase/types"

interface BankingFormProps {
  bankingAccount?: BankingAccount
}

/**
 * Server Component form that posts to Next.js Server Actions.
 * Note: React 18 types expect `form.action` to be a string. We cast to `any`
 * so TS accepts the function reference while runtime behavior remains correct.
 */
export default function BankingForm({ bankingAccount }: BankingFormProps) {
  const formAction = bankingAccount ? updateBankingAccount.bind(null, bankingAccount.id) : createBankingAccount

  return (
    <form action={formAction as any} className="space-y-4">
      <input type="hidden" name="id" value={bankingAccount?.id ?? ""} />

      <div className="grid gap-2">
        <Label htmlFor="bank_name">Bank Name</Label>
        <Input id="bank_name" name="bank_name" type="text" defaultValue={bankingAccount?.bank_name ?? ""} required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="account_name">Account Name</Label>
        <Input
          id="account_name"
          name="account_name"
          type="text"
          defaultValue={bankingAccount?.account_name ?? ""}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="account_number">Account Number</Label>
        <Input
          id="account_number"
          name="account_number"
          type="text"
          defaultValue={bankingAccount?.account_number ?? ""}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="balance">Balance</Label>
        <Input
          id="balance"
          name="balance"
          type="number"
          step="0.01"
          defaultValue={bankingAccount?.balance ?? 0}
          required
        />
      </div>

      <Button type="submit" className="w-full">
        {bankingAccount ? "Update Account" : "Create Account"}
      </Button>
    </form>
  )
}
