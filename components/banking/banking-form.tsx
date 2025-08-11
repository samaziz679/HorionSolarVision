"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { createBankAccount, updateBankAccount, type State } from "@/app/banking/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Banking } from "@/lib/supabase/types"

export default function BankingForm({ bankingAccount }: { bankingAccount?: Banking }) {
  const [state, setState] = useState<State>({ message: null, errors: {} })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setState({ message: null, errors: {} })

    try {
      const action = bankingAccount ? updateBankAccount.bind(null, bankingAccount.id) : createBankAccount
      const result = await action(state, formData)
      setState(result)
    } catch (error) {
      setState({ message: "An error occurred", errors: {} })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (state.message) {
      if (state.success === false) {
        toast.error(state.message)
      }
    }
  }, [state])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit(new FormData(e.target))
      }}
      className="space-y-4"
    >
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
      <SubmitButton isEditing={!!bankingAccount} isLoading={isLoading} />
    </form>
  )
}

function SubmitButton({ isEditing, isLoading }: { isEditing: boolean; isLoading: boolean }) {
  return (
    <Button type="submit" disabled={isLoading} className="w-full">
      {isLoading
        ? isEditing
          ? "Updating..."
          : "Creating..."
        : isEditing
          ? "Update Bank Account"
          : "Create Bank Account"}
    </Button>
  )
}
