'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';

const FormSchema = z.object({
  id: z.string().optional(),
  product_id: z.string().min(1, 'Product is required.'),
  supplier_id: z.string().min(1, 'Supplier is required.'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1.'),
  total_amount: z.coerce.number().gt(0, 'Total amount must be greater than 0.'),
  purchase_date: z.string().min(1, 'Purchase Date is required.'),
  created_at: z.string().optional(),
  user_id: z.string().optional(),
});

const CreatePurchase = FormSchema.omit({ id: true, created_at: true, user_id: true });
const UpdatePurchase = FormSchema.omit({ created_at: true, user_id: true });

export type State = {
  errors?: {
    product_id?: string[];
    supplier_id?: string[];
    quantity?: string[];
    total_amount?: string[];
    purchase_date?: string[];
  };
  message?: string | null;
};

export async function createPurchase(prevState: State, formData: FormData) {
  const validatedFields = CreatePurchase.safeParse({
    product_id: formData.get('product_id'),
    supplier_id: formData.get('supplier_id'),
    quantity: formData.get('quantity'),
    total_amount: formData.get('total_amount'),
    purchase_date: formData.get('purchase_date'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Purchase.',
    };
  }

  const { product_id, supplier_id, quantity, total_amount, purchase_date } = validatedFields.data;
  const supabase = createClient();
  const user = await getAuthUser();

  try {
    const { error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        product_id,
        supplier_id,
        quantity,
        total_amount,
        purchase_date,
        user_id: user.id,
      });

    if (purchaseError) {
      console.error('Database Error (Purchase):', purchaseError);
      return { message: 'Database Error: Failed to Create Purchase.' };
    }

    // Update product stock quantity
    const { data: product, error: fetchProductError } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', product_id)
      .single();

    if (fetchProductError || !product) {
      console.error('Database Error (Fetch Product):', fetchProductError);
      return { message: 'Database Error: Failed to fetch product for stock update.' };
    }

    const newStockQuantity = product.stock_quantity + quantity;

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
    return { message: 'Unexpected Error: Failed to Create Purchase.' };
  }

  revalidatePath('/purchases');
  revalidatePath('/inventory'); // Revalidate inventory page as stock changes
  redirect('/purchases');
}

export async function updatePurchase(id: string, prevState: State, formData: FormData) {
  const validatedFields = UpdatePurchase.safeParse({
    id: formData.get('id'),
    product_id: formData.get('product_id'),
    supplier_id: formData.get('supplier_id'),
    quantity: formData.get('quantity'),
    total_amount: formData.get('total_amount'),
    purchase_date: formData.get('purchase_date'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Purchase.',
    };
  }

  const { product_id, supplier_id, quantity, total_amount, purchase_date } = validatedFields.data;
  const supabase = createClient();
  const user = await getAuthUser();

  try {
    // Fetch old quantity to correctly adjust stock
    const { data: oldPurchase, error: fetchOldPurchaseError } = await supabase
      .from('purchases')
      .select('quantity, product_id')
      .eq('id', id)
      .single();

    if (fetchOldPurchaseError || !oldPurchase) {
      console.error('Database Error (Fetch Old Purchase):', fetchOldPurchaseError);
      return { message: 'Database Error: Failed to fetch old purchase data.' };
    }

    const oldQuantity = oldPurchase.quantity;
    const oldProductId = oldPurchase.product_id;

    const { error: purchaseError } = await supabase
      .from('purchases')
      .update({
        product_id,
        supplier_id,
        quantity,
        total_amount,
        purchase_date,
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (purchaseError) {
      console.error('Database Error (Purchase):', purchaseError);
      return { message: 'Database Error: Failed to Update Purchase.' };
    }

    // Adjust stock quantity for old product if product_id changed
    if (oldProductId !== product_id) {
      // Decrease stock for old product
      const { data: oldProduct, error: fetchOldProductError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', oldProductId)
        .single();

      if (fetchOldProductError || !oldProduct) {
        console.error('Database Error (Fetch Old Product):', fetchOldProductError);
        return { message: 'Database Error: Failed to fetch old product for stock adjustment.' };
      }

      const newOldProductStock = oldProduct.stock_quantity - oldQuantity;
      await supabase
        .from('products')
        .update({ stock_quantity: newOldProductStock })
        .eq('id', oldProductId)
        .eq('user_id', user.id);

      // Increase stock for new product
      const { data: newProduct, error: fetchNewProductError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', product_id)
        .single();

      if (fetchNewProductError || !newProduct) {
        console.error('Database Error (Fetch New Product):', fetchNewProductError);
        return { message: 'Database Error: Failed to fetch new product for stock adjustment.' };
      }

      const newNewProductStock = newProduct.stock_quantity + quantity;
      await supabase
        .from('products')
        .update({ stock_quantity: newNewProductStock })
        .eq('id', product_id)
        .eq('user_id', user.id);

    } else {
      // Adjust stock for the same product
      const stockDifference = quantity - oldQuantity;
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
    return { message: 'Unexpected Error: Failed to Update Purchase.' };
  }

  revalidatePath('/purchases');
  revalidatePath('/inventory'); // Revalidate inventory page as stock changes
  redirect('/purchases');
}

export async function deletePurchase(id: string) {
  const supabase = createClient();
  const user = await getAuthUser();

  try {
    // Fetch purchase details to revert stock quantity
    const { data: purchase, error: fetchPurchaseError } = await supabase
      .from('purchases')
      .select('product_id, quantity')
      .eq('id', id)
      .single();

    if (fetchPurchaseError || !purchase) {
      console.error('Database Error (Fetch Purchase):', fetchPurchaseError);
      return { message: 'Database Error: Failed to fetch purchase for deletion.' };
    }

    const { error: deleteError } = await supabase
      .from('purchases')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Database Error (Delete Purchase):', deleteError);
      return { message: 'Database Error: Failed to Delete Purchase.' };
    }

    // Revert product stock quantity
    const { data: product, error: fetchProductError } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', purchase.product_id)
      .single();

    if (fetchProductError || !product) {
      console.error('Database Error (Fetch Product for Revert):', fetchProductError);
      return { message: 'Database Error: Failed to fetch product for stock revert.' };
    }

    const newStockQuantity = product.stock_quantity - purchase.quantity;
    const { error: updateStockError } = await supabase
      .from('products')
      .update({ stock_quantity: newStockQuantity })
      .eq('id', purchase.product_id)
      .eq('user_id', user.id);

    if (updateStockError) {
      console.error('Database Error (Update Stock for Revert):', updateStockError);
      return { message: 'Database Error: Failed to revert product stock.' };
    }

  } catch (error) {
    console.error('Unexpected Error:', error);
    return { message: 'Unexpected Error: Failed to Delete Purchase.' };
  }

  revalidatePath('/purchases');
  revalidatePath('/inventory'); // Revalidate inventory page as stock changes
}
