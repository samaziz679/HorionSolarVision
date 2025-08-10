'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';

const FormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required.'),
  contact_person: z.string().optional().nullable(),
  email: z.string().email('Invalid email address.').optional().nullable(),
  phone_number: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  created_at: z.string().optional(),
  user_id: z.string().optional(),
});

const CreateSupplier = FormSchema.omit({ id: true, created_at: true, user_id: true });
const UpdateSupplier = FormSchema.omit({ created_at: true, user_id: true });

export type State = {
  errors?: {
    name?: string[];
    contact_person?: string[];
    email?: string[];
    phone_number?: string[];
    address?: string[];
  };
  message?: string | null;
};

export async function createSupplier(prevState: State, formData: FormData) {
  const validatedFields = CreateSupplier.safeParse({
    name: formData.get('name'),
    contact_person: formData.get('contact_person'),
    email: formData.get('email'),
    phone_number: formData.get('phone_number'),
    address: formData.get('address'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Supplier.',
    };
  }

  const { name, contact_person, email, phone_number, address } = validatedFields.data;
  const supabase = createClient();
  const user = await getAuthUser();

  try {
    const { error } = await supabase
      .from('suppliers')
      .insert({
        name,
        contact_person,
        email,
        phone_number,
        address,
        user_id: user.id,
      });

    if (error) {
      console.error('Database Error:', error);
      return { message: 'Database Error: Failed to Create Supplier.' };
    }
  } catch (error) {
    console.error('Unexpected Error:', error);
    return { message: 'Unexpected Error: Failed to Create Supplier.' };
  }

  revalidatePath('/suppliers');
  redirect('/suppliers');
}

export async function updateSupplier(id: string, prevState: State, formData: FormData) {
  const validatedFields = UpdateSupplier.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    contact_person: formData.get('contact_person'),
    email: formData.get('email'),
    phone_number: formData.get('phone_number'),
    address: formData.get('address'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Supplier.',
    };
  }

  const { name, contact_person, email, phone_number, address } = validatedFields.data;
  const supabase = createClient();
  const user = await getAuthUser();

  try {
    const { error } = await supabase
      .from('suppliers')
      .update({
        name,
        contact_person,
        email,
        phone_number,
        address,
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Database Error:', error);
      return { message: 'Database Error: Failed to Update Supplier.' };
    }
  } catch (error) {
    console.error('Unexpected Error:', error);
    return { message: 'Unexpected Error: Failed to Update Supplier.' };
  }

  revalidatePath('/suppliers');
  redirect('/suppliers');
}

export async function deleteSupplier(id: string) {
  const supabase = createClient();
  const user = await getAuthUser();

  try {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Database Error:', error);
      return { message: 'Database Error: Failed to Delete Supplier.' };
    }
  } catch (error) {
    console.error('Unexpected Error:', error);
    return { message: 'Unexpected Error: Failed to Delete Supplier.' };
  }

  revalidatePath('/suppliers');
}
