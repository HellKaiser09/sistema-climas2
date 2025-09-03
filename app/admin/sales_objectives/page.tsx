"use client";

import { useEffect, useState } from "react";
import { createSalesObjective, getUsers } from "../../../lib/supabase/sales_objectives";

export default function SalesObjectiveForm() {
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [userId, setUserId] = useState("");
  const [month, setMonth] = useState<number | "">("");
  const [year, setYear] = useState<number | "">("");
  const [leadsTarget, setLeadsTarget] = useState<number | "">("");
  const [salesTarget, setSalesTarget] = useState<number | "">("");
  const [salesTargetValue, setSalesTargetValue] = useState<number | "">("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error(error);
      }
    }
    loadUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || month === "" || year === "" || leadsTarget === "" || salesTarget === "" || salesTargetValue === "") {
      setMessage("Completa todos los campos");
      return;
    }

    try {
      await createSalesObjective({
        user_id: userId,
        month: Number(month),
        year: Number(year),
        leads_target: Number(leadsTarget),
        sales_target: Number(salesTarget),
        sales_target_type: "amount",
        sales_target_value: Number(salesTargetValue),
      });
      setMessage("Objetivo creado exitosamente");
      // reset
      setUserId("");
      setMonth("");
      setYear("");
      setLeadsTarget("");
      setSalesTarget("");
      setSalesTargetValue("");
    } catch (error: any) {
      console.error(error);
      setMessage(`Error guardando: ${error.message || "Revisa la consola"}`);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Registrar Objetivo de Venta</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <select value={userId} onChange={(e) => setUserId(e.target.value)} required className="border rounded-lg p-2">
          <option value="">Selecciona un Usuario</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>

        <input type="number" placeholder="Mes" value={month}  min={1} max= {12} onChange={(e) => setMonth(Number(e.target.value))} required className="border rounded-lg p-2" />
        <input type="number" placeholder="Año" value={year} min= {2025} max= {2050} onChange={(e) => setYear(Number(e.target.value))} required className="border rounded-lg p-2" />
        <input type="number" placeholder="Leads Target"  value={leadsTarget} min={1} onChange={(e) => setLeadsTarget(Number(e.target.value))} required className="border rounded-lg p-2" />
        <input type="number" placeholder="Sales Target" value={salesTarget} min={1} onChange={(e) => setSalesTarget(Number(e.target.value))} required className="border rounded-lg p-2" />
        <input type="number" placeholder="Sales Target Value" value={salesTargetValue} min={1} onChange={(e) => setSalesTargetValue(Number(e.target.value))} required className="border rounded-lg p-2" />

        <button type="submit" className="bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 transition">
          Crear Objetivo
        </button>
      </form>
      {message && <p className="mt-4 text-center font-semibold">{message}</p>}
    </div>
  );
}
