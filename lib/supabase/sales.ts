
import { createClient } from "./client";

export interface Sale {

  lead_id: string;            // uuid
  salesperson_id: string;     // uuid
  technician_id: string;      // uuid
  service_date: string;       // timestamp ISO (ej. new Date().toISOString())
  payment_method: string;     // varchar

  rfc: string;                // varchar
  requires_invoice: boolean;  // bool
  client_name: string;        // varchar
  client_address: string;     // text
  total_amount: number;       // numeric

  status: string;             // varchar
}

/** Guardar venta???
 * No incluimos id, created_at ni updated_at (los genera Supabase).
 */
export async function saveSale(
  sale: Omit<Sale, "id" | "created_at" | "updated_at">
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("sales")   
    .insert([sale])
    .select();

  if (error) {
    console.error("Error al insertar venta (saveSale):", error);
    throw error;
  }

  return data;
}

/**Obtener ventas??? */
export async function getSales() {
  const supabase = createClient();
  const { data, error } = await supabase.from("sales").select("*");

  if (error) {
    console.error("Error al obtener ventas (getSales):", error);
    throw error;
  }
  return data;
}


