'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';

const FormSchema = z.object({
  id: z.string().optional(),
  amount: z.coerce.number().gt(0, 'Amount must be greater than 0.'),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  date: z.string().min(1, 'Date is required.'),
  created_at: z.string().optional(),
  user_id: z.string().optional(),
});

const CreateExpense = FormSchema.omit({ id: true, created_at: true, user_id: true });
const UpdateExpense = FormSchema.omit({ created_at: true, user_id: true });

export type State = {
  errors?: {
    amount?: string[];
    category?: string[];
    description?: string[];
    date?: string[];
  };
  message?: string | null;
};

export async function createExpense(prevState: State, formData: FormData) {
  const validatedFields = CreateExpense.safeParse({
    amount: formData.get('amount'),
    category: formData.get('category'),
    description: formData.get('description'),
    date: formData.get('date'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Expense.',
    };
  }

  const { amount, category, description, date } = validatedFields.data;
  const supabase = createClient();
  const user = await getAuthUser();

  try {
    const { error } = await supabase
      .from('expenses')
      .insert({
        amount,
        category,
        description,
        date,
        user_id: user.id,
      });

    if (error) {
      console.error('Database Error:', error);
      return { message: 'Database Error: Failed to Create Expense.' };
    }
  } catch (error) {
    console.error('Unexpected Error:', error);
    return { message: 'Unexpected Error: Failed to Create Expense.' };
  }

  revalidatePath('/expenses');
  redirect('/expenses');
}

export async function updateExpense(id: string, prevState: State, formData: FormData) {
  const validatedFields = UpdateExpense.safeParse({
    id: formData.get('id'),
    amount: formData.get('amount'),
    category: formData.get('category'),
    description: formData.get('description'),
    date: formData.get('date'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Expense.',
    };
  }

  const { amount, category, description, date } = validatedFields.data;
  const supabase = createClient();
  const user = await getAuthUser();

  try {
    const { error } = await supabase
      .from('expenses')
      .update({
        amount,
        category,
        description,
        date,
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Database Error:', error);
      return { message: 'Database Error: Failed to Update Expense.' };
    }
  } catch (error) {
    console.error('Unexpected Error:', error);
    return { message: 'Unexpected Error: Failed to Update Expense.' };
  }

  revalidatePath('/expenses');
  redirect('/expenses');
}

export async function deleteExpense(id: string) {
  const supabase = createClient();
  const user = await getAuthUser();

  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Database Error:', error);
      return { message: 'Database Error: Failed to Delete Expense.' };
    }
  } catch (error) {
    console.error('Unexpected Error:', error);
    return { message: 'Unexpected Error: Failed to Delete Expense.' };
  }

  revalidatePath('/expenses');
}
