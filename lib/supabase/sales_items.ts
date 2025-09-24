// lib/supabase/saleItems.ts
import { createClient } from "./client";
import { v4 as uuidv4 } from "uuid";

export interface SaleItem {
  sale_id: string;      
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  
  
}


export async function saveSaleItem(item: Omit<SaleItem, "created_at" | "updated_at">) {
  const supabase = createClient();

  
  const itemWithId = {
    ...item,
    
  };

  const { data, error } = await supabase
    .from("sale_items")
    .insert([itemWithId])
    .select();

  if (error) {
    console.error("Error guardando el producto en la venta:", error);
    throw error;
  }

  return data;
}

