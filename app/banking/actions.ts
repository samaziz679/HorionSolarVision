'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';

const FormSchema = z.object({
  id: z.string().optional(),
  bank_name: z.string().min(1, 'Bank Name is required.'),
  account_name: z.string().min(1, 'Account Name is required.'),
  account_number: z.string().min(1, 'Account Number is required.'),
  balance: z.coerce.number().gt(0, 'Balance must be greater than 0.'),
  created_at: z.string().optional(),
  user_id: z.string().optional(),
});

const CreateBankingAccount = FormSchema.omit({ id: true, created_at: true, user_id: true });
const UpdateBankingAccount = FormSchema.omit({ created_at: true, user_id: true });

export type State = {
  errors?: {
    bank_name?: string[];
    account_name?: string[];
    account_number?: string[];
    balance?: string[];
  };
  message?: string | null;
};

export async function createBankingAccount(prevState: State, formData: FormData) {
  const validatedFields = CreateBankingAccount.safeParse({
    bank_name: formData.get('bank_name'),
    account_name: formData.get('account_name'),
    account_number: formData.get('account_number'),
    balance: formData.get('balance'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Banking Account.',
    };
  }

  const { bank_name, account_name, account_number, balance } = validatedFields.data;
  const supabase = createClient();
  const user = await getAuthUser();

  try {
    const { error } = await supabase
      .from('banking_accounts')
      .insert({
        bank_name,
        account_name,
        account_number,
        balance,
        user_id: user.id,
      });

    if (error) {
      console.error('Database Error:', error);
      return { message: 'Database Error: Failed to Create Banking Account.' };
    }
  } catch (error) {
    console.error('Unexpected Error:', error);
    return { message: 'Unexpected Error: Failed to Create Banking Account.' };
  }

  revalidatePath('/banking');
  redirect('/banking');
}

export async function updateBankingAccount(id: string, prevState: State, formData: FormData) {
  const validatedFields = UpdateBankingAccount.safeParse({
    id: formData.get('id'),
    bank_name: formData.get('bank_name'),
    account_name: formData.get('account_name'),
    account_number: formData.get('account_number'),
    balance: formData.get('balance'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Banking Account.',
    };
  }

  const { bank_name, account_name, account_number, balance } = validatedFields.data;
  const supabase = createClient();
  const user = await getAuthUser();

  try {
    const { error } = await supabase
      .from('banking_accounts')
      .update({
        bank_name,
        account_name,
        account_number,
        balance,
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Database Error:', error);
      return { message: 'Database Error: Failed to Update Banking Account.' };
    }
  } catch (error) {
    console.error('Unexpected Error:', error);
    return { message: 'Unexpected Error: Failed to Update Banking Account.' };
  }

  revalidatePath('/banking');
  redirect('/banking');
}

export async function deleteBankingAccount(id: string) {
  const supabase = createClient();
  const user = await getAuthUser();

  try {
    const { error } = await supabase
      .from('banking_accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Database Error:', error);
      return { message: 'Database Error: Failed to Delete Banking Account.' };
    }
  } catch (error) {
    console.error('Unexpected Error:', error);
    return { message: 'Unexpected Error: Failed to Delete Banking Account.' };
  }

  revalidatePath('/banking');
}
