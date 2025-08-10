"use client"

import { useFormState, useFormStatus } from "react-dom"
import { createBankAccount, updateBankAccount, type State } from "@/app/banking/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { BankAccount } from "@/lib/supabase/types"
import { useEffect } from "react"

export default function BankingForm({ bankAccount }: { bankAccount?: BankAccount | null }) {
  const initialState: State = { message: null, errors: {} }
  const action = bankAccount ? updateBankAccount.bind(null, bankAccount.id) : createBankAccount
  const [state, dispatch] = useFormState(action, initialState)

  useEffect(() => {
    if (state.message && !state.errors) {
      alert(state.message)
    }
  }, [state])

  return (
    <form action={dispatch} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="account_name">Account Name</Label>
          <Input id="account_name" name="account_name" defaultValue={bankAccount?.account_name} required />
          {state.errors?.account_name && <p className="text-sm text-red-500">{state.errors.account_name}</p>}
        </div>
        <div>
          <Label htmlFor="bank_name">Bank Name</Label>
          <Input id="bank_name" name="bank_name" defaultValue={bankAccount?.bank_name} required />
          {state.errors?.bank_name && <p className="text-sm text-red-500">{state.errors.bank_name}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="account_number">Account Number</Label>
          <Input id="account_number" name="account_number" defaultValue={bankAccount?.account_number} required />
          {state.errors?.account_number && <p className="text-sm text-red-500">{state.errors.account_number}</p>}
        </div>
        <div>
          <Label htmlFor="initial_balance">Initial Balance</Label>
          <Input
            id="initial_balance"
            name="initial_balance"
            type="number"
            step="0.01"
            defaultValue={bankAccount?.initial_balance}
            required
            disabled={!!bankAccount} // Can't change balance after creation
          />
          {state.errors?.initial_balance && <p className="text-sm text-red-500">{state.errors.initial_balance}</p>}
        </div>
      </div>
      <div className="flex justify-end gap-4">
        <SubmitButton text={bankAccount ? "Update Account" : "Create Account"} />
      </div>
    </form>
  )
}

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : text}
    </Button>
  )
}
