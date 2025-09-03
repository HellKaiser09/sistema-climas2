import { createClient } from "../../lib/supabase/client";

export interface SalesObjective {
  id?: number;
  user_id: string;
  month: number;
  year: number;
  leads_target: number;
  sales_target: number;
  sales_target_type: string; // siempre "amount"
  sales_target_value: number;
  created_at?: string;
}

export async function createSalesObjective(
  objective: Omit<SalesObjective, "id" | "created_at">
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("sales_objectives")
    .insert([objective])
    .select();

  if (error) {
    console.error("Tuviste un error creando la venta skill issue amigo 💀💀💀:", error);
    throw error;
  }

  return data;
}

export async function getUsers() {
  const supabase = createClient();
  const { data, error } = await supabase.from("users").select("id, name");
  if (error) throw error;
  return data;
}
