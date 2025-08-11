"use client"

import { useEffect } from "react"
import { useFormState, useFormStatus } from "react"
import { toast } from "sonner"
import { createBankAccount, updateBankAccount, type State } from "@/app/banking/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { BankAccount } from "@/lib/supabase/types"

export function BankingForm({ bankAccount }: { bankAccount?: BankAccount }) {
  const initialState: State = { message: null, errors: {} }
  const action = bankAccount ? updateBankAccount.bind(null, bankAccount.id) : createBankAccount
  const [state, dispatch] = useFormState(action, initialState)

  useEffect(() => {
    if (state.message) {
      if (Object.keys(state.errors ?? {}).length > 0) {
        toast.error(state.message)
      } else {
        toast.success(state.message)
      }
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
            defaultValue={bankAccount?.bank_name}
            aria-describedby="bank_name-error"
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
            defaultValue={bankAccount?.account_number}
            aria-describedby="account_number-error"
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
        <Label htmlFor="account_holder_name">Account Holder Name</Label>
        <Input
          id="account_holder_name"
          name="account_holder_name"
          defaultValue={bankAccount?.account_holder_name}
          aria-describedby="account_holder_name-error"
        />
        <div id="account_holder_name-error" aria-live="polite" aria-atomic="true">
          {state.errors?.account_holder_name &&
            state.errors.account_holder_name.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={bankAccount?.notes ?? ""} aria-describedby="notes-error" />
        <div id="notes-error" aria-live="polite" aria-atomic="true">
          {state.errors?.notes &&
            state.errors.notes.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>
      <SubmitButton isEditing={!!bankAccount} />
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
