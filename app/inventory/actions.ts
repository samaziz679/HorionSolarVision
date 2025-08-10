'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';

const FormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Product Name is required.'),
  description: z.string().optional().nullable(),
  price: z.coerce.number().gt(0, 'Price must be greater than 0.'),
  stock_quantity: z.coerce.number().int().min(0, 'Stock quantity cannot be negative.'),
  sku: z.string().optional().nullable(),
  created_at: z.string().optional(),
  user_id: z.string().optional(),
});

const CreateProduct = FormSchema.omit({ id: true, created_at: true, user_id: true });
const UpdateProduct = FormSchema.omit({ created_at: true, user_id: true });

export type State = {
  errors?: {
    name?: string[];
    description?: string[];
    price?: string[];
    stock_quantity?: string[];
    sku?: string[];
  };
  message?: string | null;
};

export async function createProduct(prevState: State, formData: FormData) {
  const validatedFields = CreateProduct.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
    stock_quantity: formData.get('stock_quantity'),
    sku: formData.get('sku'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Product.',
    };
  }

  const { name, description, price, stock_quantity, sku } = validatedFields.data;
  const supabase = createClient();
  const user = await getAuthUser();

  try {
    const { error } = await supabase
      .from('products')
      .insert({
        name,
        description,
        price,
        stock_quantity,
        sku,
        user_id: user.id,
      });

    if (error) {
      console.error('Database Error:', error);
      return { message: 'Database Error: Failed to Create Product.' };
    }
  } catch (error) {
    console.error('Unexpected Error:', error);
    return { message: 'Unexpected Error: Failed to Create Product.' };
  }

  revalidatePath('/inventory');
  redirect('/inventory');
}

export async function updateProduct(id: string, prevState: State, formData: FormData) {
  const validatedFields = UpdateProduct.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
    stock_quantity: formData.get('stock_quantity'),
    sku: formData.get('sku'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Product.',
    };
  }

  const { name, description, price, stock_quantity, sku } = validatedFields.data;
  const supabase = createClient();
  const user = await getAuthUser();

  try {
    const { error } = await supabase
      .from('products')
      .update({
        name,
        description,
        price,
        stock_quantity,
        sku,
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Database Error:', error);
      return { message: 'Database Error: Failed to Update Product.' };
    }
  } catch (error) {
    console.error('Unexpected Error:', error);
    return { message: 'Unexpected Error: Failed to Update Product.' };
  }

  revalidatePath('/inventory');
  redirect('/inventory');
}

export async function deleteProduct(id: string) {
  const supabase = createClient();
  const user = await getAuthUser();

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Database Error:', error);
      return { message: 'Database Error: Failed to Delete Product.' };
    }
  } catch (error) {
    console.error('Unexpected Error:', error);
    return { message: 'Unexpected Error: Failed to Delete Product.' };
  }

  revalidatePath('/inventory');
}
