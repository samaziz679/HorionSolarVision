"use client"

import type { BankAccount } from "@/lib/supabase/types"
import { useFormState } from "react-dom"
import { createBankAccount, updateBankAccount } from "@/app/banking/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { toast } from "sonner"

interface BankingFormProps {
  account?: BankAccount | null
}

export default function BankingForm({ account }: BankingFormProps) {
  const formAction = account ? updateBankAccount.bind(null, account.id) : createBankAccount
  const [state, dispatch] = useFormState(formAction, { message: null, errors: {} })

  useEffect(() => {
    if (state.message) {
      if (state.errors) {
        toast.error(state.message)
      } else {
        toast.success(state.message)
      }
    }
  }, [state])

  return (
    <form action={dispatch} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="account_name">Account Name</Label>
          <Input
            id="account_name"
            name="account_name"
            defaultValue={account?.account_name}
            aria-describedby="account_name-error"
          />
          {state.errors?.account_name && (
            <p id="account_name-error" className="text-sm text-red-500">
              {state.errors.account_name}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="bank_name">Bank Name</Label>
          <Input id="bank_name" name="bank_name" defaultValue={account?.bank_name} aria-describedby="bank_name-error" />
          {state.errors?.bank_name && (
            <p id="bank_name-error" className="text-sm text-red-500">
              {state.errors.bank_name}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="account_type">Account Type</Label>
          <Input
            id="account_type"
            name="account_type"
            defaultValue={account?.account_type}
            aria-describedby="account_type-error"
          />
          {state.errors?.account_type && (
            <p id="account_type-error" className="text-sm text-red-500">
              {state.errors.account_type}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="balance">Initial Balance</Label>
          <Input
            id="balance"
            name="balance"
            type="number"
            step="0.01"
            defaultValue={account?.balance}
            aria-describedby="balance-error"
          />
          {state.errors?.balance && (
            <p id="balance-error" className="text-sm text-red-500">
              {state.errors.balance}
            </p>
          )}
        </div>
      </div>
      <Button type="submit">{account ? "Update Account" : "Create Account"}</Button>
    </form>
  )
}
