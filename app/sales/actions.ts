'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';

const FormSchema = z.object({
  id: z.string().optional(),
  product_id: z.string().min(1, 'Product is required.'),
  client_id: z.string().min(1, 'Client is required.'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1.'),
  total_amount: z.coerce.number().gt(0, 'Total amount must be greater than 0.'),
  sale_date: z.string().min(1, 'Sale Date is required.'),
  created_at: z.string().optional(),
  user_id: z.string().optional(),
});

const CreateSale = FormSchema.omit({ id: true, created_at: true, user_id: true });
const UpdateSale = FormSchema.omit({ created_at: true, user_id: true });

export type State = {
  errors?: {
    product_id?: string[];
    client_id?: string[];
    quantity?: string[];
    total_amount?: string[];
    sale_date?: string[];
  };
  message?: string | null;
};

export async function createSale(prevState: State, formData: FormData) {
  const validatedFields = CreateSale.safeParse({
    product_id: formData.get('product_id'),
    client_id: formData.get('client_id'),
    quantity: formData.get('quantity'),
    total_amount: formData.get('total_amount'),
    sale_date: formData.get('sale_date'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Sale.',
    };
  }

  const { product_id, client_id, quantity, total_amount, sale_date } = validatedFields.data;
  const supabase = createClient();
  const user = await getAuthUser();

  try {
    // Check if there's enough stock
    const { data: product, error: fetchProductError } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', product_id)
      .single();

    if (fetchProductError || !product) {
      console.error('Database Error (Fetch Product):', fetchProductError);
      return { message: 'Database Error: Failed to fetch product for stock check.' };
    }

    if (product.stock_quantity < quantity) {
      return { message: 'Insufficient stock for this product.' };
    }

    const { error: saleError } = await supabase
      .from('sales')
      .insert({
        product_id,
        client_id,
        quantity,
        total_amount,
        sale_date,
        user_id: user.id,
      });

    if (saleError) {
      console.error('Database Error (Sale):', saleError);
      return { message: 'Database Error: Failed to Create Sale.' };
    }

    // Decrease product stock quantity
    const newStockQuantity = product.stock_quantity - quantity;

    const { error: updateStockError } = await supabase
      .from('products')
      .update({ stock_quantity: newStockQuantity })
      .eq('id', product_id)
      .eq('user_id', user.id);

    if (updateStockError) {
      console.error('Database Error (Update Stock):', updateStockError);
      return { message: 'Database Error: Failed to update product stock.' };
    }

  } catch (error) {
    console.error('Unexpected Error:', error);
    return { message: 'Unexpected Error: Failed to Create Sale.' };
  }

  revalidatePath('/sales');
  revalidatePath('/inventory'); // Revalidate inventory page as stock changes
  redirect('/sales');
}

export async function updateSale(id: string, prevState: State, formData: FormData) {
  const validatedFields = UpdateSale.safeParse({
    id: formData.get('id'),
    product_id: formData.get('product_id'),
    client_id: formData.get('client_id'),
    quantity: formData.get('quantity'),
    total_amount: formData.get('total_amount'),
    sale_date: formData.get('sale_date'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Sale.',
    };
  }

  const { product_id, client_id, quantity, total_amount, sale_date } = validatedFields.data;
  const supabase = createClient();
  const user = await getAuthUser();

  try {
    // Fetch old quantity and product_id to correctly adjust stock
    const { data: oldSale, error: fetchOldSaleError } = await supabase
      .from('sales')
      .select('quantity, product_id')
      .eq('id', id)
      .single();

    if (fetchOldSaleError || !oldSale) {
      console.error('Database Error (Fetch Old Sale):', fetchOldSaleError);
      return { message: 'Database Error: Failed to fetch old sale data.' };
    }

    const oldQuantity = oldSale.quantity;
    const oldProductId = oldSale.product_id;

    // Update the sale record
    const { error: saleError } = await supabase
      .from('sales')
      .update({
        product_id,
        client_id,
        quantity,
        total_amount,
        sale_date,
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (saleError) {
      console.error('Database Error (Sale):', saleError);
      return { message: 'Database Error: Failed to Update Sale.' };
    }

    // Adjust stock quantity
    if (oldProductId !== product_id) {
      // Increase stock for old product
      const { data: oldProduct, error: fetchOldProductError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', oldProductId)
        .single();

      if (fetchOldProductError || !oldProduct) {
        console.error('Database Error (Fetch Old Product):', fetchOldProductError);
        return { message: 'Database Error: Failed to fetch old product for stock adjustment.' };
      }

      const newOldProductStock = oldProduct.stock_quantity + oldQuantity;
      await supabase
        .from('products')
        .update({ stock_quantity: newOldProductStock })
        .eq('id', oldProductId)
        .eq('user_id', user.id);

      // Decrease stock for new product, checking for sufficiency
      const { data: newProduct, error: fetchNewProductError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', product_id)
        .single();

      if (fetchNewProductError || !newProduct) {
        console.error('Database Error (Fetch New Product):', fetchNewProductError);
        return { message: 'Database Error: Failed to fetch new product for stock adjustment.' };
      }

      if (newProduct.stock_quantity < quantity) {
        // Revert changes if new product stock is insufficient
        await supabase
          .from('products')
          .update({ stock_quantity: oldProduct.stock_quantity })
          .eq('id', oldProductId)
          .eq('user_id', user.id);
        return { message: 'Insufficient stock for the new product.' };
      }

      const newNewProductStock = newProduct.stock_quantity - quantity;
      await supabase
        .from('products')
        .update({ stock_quantity: newNewProductStock })
        .eq('id', product_id)
        .eq('user_id', user.id);

    } else {
      // Adjust stock for the same product
      const stockDifference = oldQuantity - quantity; // If quantity decreased, stock increases
      const { data: product, error: fetchProductError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', product_id)
        .single();

      if (fetchProductError || !product) {
        console.error('Database Error (Fetch Product):', fetchProductError);
        return { message: 'Database Error: Failed to fetch product for stock update.' };
      }

      const newStockQuantity = product.stock_quantity + stockDifference;

      if (newStockQuantity < 0) {
        return { message: 'Insufficient stock for this product after quantity adjustment.' };
      }

      const { error: updateStockError } = await supabase
        .from('products')
        .update({ stock_quantity: newStockQuantity })
        .eq('id', product_id)
        .eq('user_id', user.id);

      if (updateStockError) {
        console.error('Database Error (Update Stock):', updateStockError);
        return { message: 'Database Error: Failed to update product stock.' };
      }
    }

  } catch (error) {
    console.error('Unexpected Error:', error);
    return { message: 'Unexpected Error: Failed to Update Sale.' };
  }

  revalidatePath('/sales');
  revalidatePath('/inventory'); // Revalidate inventory page as stock changes
  redirect('/sales');
}

export async function deleteSale(id: string) {
  const supabase = createClient();
  const user = await getAuthUser();

  try {
    // Fetch sale details to revert stock quantity
    const { data: sale, error: fetchSaleError } = await supabase
      .from('sales')
      .select('product_id, quantity')
      .eq('id', id)
      .single();

    if (fetchSaleError || !sale) {
      console.error('Database Error (Fetch Sale):', fetchSaleError);
      return { message: 'Database Error: Failed to fetch sale for deletion.' };
    }

    const { error: deleteError } = await supabase
      .from('sales')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Database Error (Delete Sale):', deleteError);
      return { message: 'Database Error: Failed to Delete Sale.' };
    }

    // Revert product stock quantity
    const { data: product, error: fetchProductError } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', sale.product_id)
      .single();

    if (fetchProductError || !product) {
      console.error('Database Error (Fetch Product for Revert):', fetchProductError);
      return { message: 'Database Error: Failed to fetch product for stock revert.' };
    }

    const newStockQuantity = product.stock_quantity + sale.quantity;
    const { error: updateStockError } = await supabase
      .from('products')
      .update({ stock_quantity: newStockQuantity })
      .eq('id', sale.product_id)
      .eq('user_id', user.id);

    if (updateStockError) {
      console.error('Database Error (Update Stock for Revert):', updateStockError);
      return { message: 'Database Error: Failed to revert product stock.' };
    }

  } catch (error) {
    console.error('Unexpected Error:', error);
    return { message: 'Unexpected Error: Failed to Delete Sale.' };
  }

  revalidatePath('/sales');
  revalidatePath('/inventory'); // Revalidate inventory page as stock changes
}
