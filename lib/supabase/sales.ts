import { supabaseClient } from "./client";


export interface Sale {
  lead_id: string;            // uuid
  salesperson_id: string;     // uuid
  technician_id: string;      // uuid
  service_date: string;       // timestamp ISO (ej. new Date().toISOString())
  payment_method: string;     // varchar

  rfc: string | null;         // varchar - permite null
  requires_invoice: boolean;  // bool
  client_name: string;        // varchar
  client_address: string;     // text
  total_amount: number;       // numeric

  status: string;             // varchar
}

/** Guardar venta con mejor manejo de errores
 * No incluimos id, created_at ni updated_at (los genera Supabase).
 */
export async function saveSale(
  sale: Omit<Sale, "id" | "created_at" | "updated_at">
) {

  console.log("Enviando datos a Supabase:", sale);

  const { data, error } = await supabaseClient
    .from("sales")   
    .insert([sale])
    .select();

  if (error) {
    console.error("Error detallado al insertar venta:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw new Error(`Error al guardar la venta: ${error.message}`);
  }

  console.log("Venta guardada exitosamente:", data);
  return data;
}

/**Obtener ventas??? */
export async function getSales() {
  const { data, error } = await supabaseClient.from("sales").select("*");

  if (error) {
    console.error("Error al obtener ventas (getSales):", error);
    throw error;
  }
  return data;
}


