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

const CreateClient = FormSchema.omit({ id: true, created_at: true, user_id: true });
const UpdateClient = FormSchema.omit({ created_at: true, user_id: true });

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

export async function createClientAction(prevState: State, formData: FormData) {
  const validatedFields = CreateClient.safeParse({
    name: formData.get('name'),
    contact_person: formData.get('contact_person'),
    email: formData.get('email'),
    phone_number: formData.get('phone_number'),
    address: formData.get('address'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Client.',
    };
  }

  const { name, contact_person, email, phone_number, address } = validatedFields.data;
  const supabase = createClient();
  const user = await getAuthUser();

  try {
    const { error } = await supabase
      .from('clients')
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
      return { message: 'Database Error: Failed to Create Client.' };
    }
  } catch (error) {
    console.error('Unexpected Error:', error);
    return { message: 'Unexpected Error: Failed to Create Client.' };
  }

  revalidatePath('/clients');
  redirect('/clients');
}

export async function updateClientAction(id: string, prevState: State, formData: FormData) {
  const validatedFields = UpdateClient.safeParse({
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
      message: 'Missing Fields. Failed to Update Client.',
    };
  }

  const { name, contact_person, email, phone_number, address } = validatedFields.data;
  const supabase = createClient();
  const user = await getAuthUser();

  try {
    const { error } = await supabase
      .from('clients')
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
      return { message: 'Database Error: Failed to Update Client.' };
    }
  } catch (error) {
    console.error('Unexpected Error:', error);
    return { message: 'Unexpected Error: Failed to Update Client.' };
  }

  revalidatePath('/clients');
  redirect('/clients');
}

export async function deleteClientAction(id: string) {
  const supabase = createClient();
  const user = await getAuthUser();

  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Database Error:', error);
      return { message: 'Database Error: Failed to Delete Client.' };
    }
  } catch (error) {
    console.error('Unexpected Error:', error);
    return { message: 'Unexpected Error: Failed to Delete Client.' };
  }

  revalidatePath('/clients');
}
