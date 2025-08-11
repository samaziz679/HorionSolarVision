"use client"

import { useEffect } from "react"
import { useFormState, useFormStatus } from "react"
import { toast } from "sonner"
import { createBankAccount, updateBankAccount, type State } from "@/app/banking/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Banking } from "@/lib/supabase/types"

export default function BankingForm({ bankingAccount }: { bankingAccount?: Banking }) {
  const initialState: State = { message: null, errors: {} }
  const action = bankingAccount ? updateBankAccount.bind(null, bankingAccount.id) : createBankAccount
  const [state, dispatch] = useFormState(action, initialState)

  useEffect(() => {
    if (state.message) {
      if (state.success === false) {
        toast.error(state.message)
      }
      // Redirect handles success, so no toast needed here
    }
  }, [state])

  return (
    <form action={dispatch} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="bank_name">Bank Name</Label>
          <Input
            id="bank_name"
            name="bank_name"
            defaultValue={bankingAccount?.bank_name}
            aria-describedby="bank_name-error"
            required
          />
          <div id="bank_name-error" aria-live="polite" aria-atomic="true">
            {state.errors?.bank_name &&
              state.errors.bank_name.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="account_number">Account Number</Label>
          <Input
            id="account_number"
            name="account_number"
            defaultValue={bankingAccount?.account_number}
            aria-describedby="account_number-error"
            required
          />
          <div id="account_number-error" aria-live="polite" aria-atomic="true">
            {state.errors?.account_number &&
              state.errors.account_number.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="account_name">Account Name</Label>
        <Input
          id="account_name"
          name="account_name"
          defaultValue={bankingAccount?.account_name}
          aria-describedby="account_name-error"
          required
        />
        <div id="account_name-error" aria-live="polite" aria-atomic="true">
          {state.errors?.account_name &&
            state.errors.account_name.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>
      {!bankingAccount && (
        <div className="space-y-2">
          <Label htmlFor="balance">Initial Balance</Label>
          <Input
            id="balance"
            name="balance"
            type="number"
            step="0.01"
            defaultValue={bankingAccount?.balance ?? 0}
            aria-describedby="balance-error"
            required
          />
          <div id="balance-error" aria-live="polite" aria-atomic="true">
            {state.errors?.balance &&
              state.errors.balance.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
      )}
      <SubmitButton isEditing={!!bankingAccount} />
    </form>
  )
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending
        ? isEditing
          ? "Updating..."
          : "Creating..."
        : isEditing
          ? "Update Bank Account"
          : "Create Bank Account"}
    </Button>
  )
}
