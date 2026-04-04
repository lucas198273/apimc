import { supabase } from '../lib/supabase';

export interface OrderData {
  order_nsu: string;
  slug?: string;
  amount: number;
  status: string;
  payment_method?: string;
  customer?: { name?: string; email?: string };
  items?: any[];
  paid_at?: string;
}

export async function salvarPedido(orderData: OrderData) {
  const { data, error } = await supabase
    .from('orders')
    .upsert(
      {
        order_nsu: orderData.order_nsu,
        slug: orderData.slug,
        amount: orderData.amount,
        status: orderData.status,
        payment_method: orderData.payment_method,
        customer_name: orderData.customer?.name || null,
        customer_email: orderData.customer?.email,
        items: orderData.items || [],
        paid_at: orderData.paid_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'order_nsu' }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { success: true, order_nsu: data.order_nsu, id: data.id };
}

export async function getPedidosByEmail(email: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_email', email.toLowerCase().trim())
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}