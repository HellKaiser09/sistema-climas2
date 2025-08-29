"use client";

import React, { useState, useEffect } from "react";
import { saveSale } from "../../lib/supabase/sales";
import { createClient } from "../../lib/supabase/client";

const supabase = createClient();

interface Lead {
  id: string;
  name: string;
  lastname: string;
  address: string;
}

interface User {
  id: string;
  name: string;
}

interface Technician {
  id: string;
  availability_status: string;
}

const SaleForm = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);

  const [leadId, setLeadId] = useState("");
  const [userId, setUserId] = useState("");
  const [technicianId, setTechnicianId] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [rfc, setRfc] = useState("");
  const [requiresInvoice, setRequiresInvoice] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [totalAmount, setTotalAmount] = useState<number | string>(0);
  const [status, setStatus] = useState<"pending" | "completed">("pending");
  const [message, setMessage] = useState("");

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      const { data: leadData } = await supabase
        .from("leads")
        .select("id, name, lastname, address");
      const { data: userData } = await supabase
        .from("users")
        .select("id, name");
      const { data: techData } = await supabase
        .from("technicians")
        .select("id, availability_status");

      if (leadData) setLeads(leadData);
      if (userData) setUsers(userData);
      if (techData) setTechnicians(techData);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leadId || !userId || !technicianId) {
      setMessage("Selecciona Lead, Usuario y Técnico");
      return;
    }

    const serviceDateISO = new Date(serviceDate).toISOString();
    const serviceDateOnly = serviceDateISO.split("T")[0];
    const amountNum = Number(totalAmount);

    if (amountNum < 0) {
      setMessage("❌ El monto total no puede ser negativo");
      return;
    }

    try {
      // Validar que no exista otra venta en el mismo día
      const dayStart = new Date(`${serviceDateOnly}T00:00:00Z`).toISOString();
      const dayEnd = new Date(`${serviceDateOnly}T23:59:59Z`).toISOString();

      const { data: existingSales, error: checkError } = await supabase
        .from("sales")
        .select("service_date")
        .gte("service_date", dayStart)
        .lte("service_date", dayEnd);

      if (checkError) throw checkError;

      if (existingSales && existingSales.length > 0) {
        setMessage(`❌ Ya existe una venta registrada para la fecha ${serviceDateOnly}`);
        return;
      }

      // Guardar venta
      await saveSale({
        lead_id: leadId,
        salesperson_id: userId,
        technician_id: technicianId,
        service_date: serviceDateISO,
        payment_method: paymentMethod,
        rfc,
        requires_invoice: requiresInvoice,
        client_name: clientName,
        client_address: clientAddress,
        total_amount: amountNum,
        status,
      });

      setMessage("✅ Venta creada exitosamente");

      // Reset formulario
      setLeadId("");
      setUserId("");
      setTechnicianId("");
      setServiceDate("");
      setPaymentMethod("");
      setRfc("");
      setRequiresInvoice(false);
      setClientName("");
      setClientAddress("");
      setTotalAmount(0);
      setStatus("pending");
    } catch (error: any) {
      console.error(error);
      setMessage(`❌ Error: ${error.message || "Revisa la consola"}`);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Registrar Venta</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Lead */}
        <select
          value={leadId}
          onChange={(e) => {
            const selected = leads.find(l => l.id === e.target.value);
            setLeadId(e.target.value);
            if (selected) {
              setClientName(`${selected.name} ${selected.lastname}`);
              setClientAddress(selected.address);
            } else {
              setClientName("");
              setClientAddress("");
            }
          }}
          required
          className="border rounded-lg p-2 focus:outline-blue-500"
        >
          <option value="">Selecciona un Lead</option>
          {leads.map(l => (
            <option key={l.id} value={l.id}>
              {l.name} {l.lastname} — {l.id.slice(0, 8)}…
            </option>
          ))}
        </select>

        {/* Usuario */}
        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          className="border rounded-lg p-2 focus:outline-blue-500"
        >
          <option value="">Selecciona un Usuario</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.name} — {u.id.slice(0, 8)}…
            </option>
          ))}
        </select>

        {/* Técnico */}
        <select
          value={technicianId}
          onChange={(e) => setTechnicianId(e.target.value)}
          required
          className="border rounded-lg p-2 focus:outline-blue-500"
        >
          <option value="">Selecciona un Técnico</option>
          {technicians.map(t => (
            <option key={t.id} value={t.id}>
              {t.availability_status} — {t.id.slice(0, 8)}…
            </option>
          ))}
        </select>

        {/* Fecha */}
        <input
          type="datetime-local"
          value={serviceDate}
          onChange={(e) => setServiceDate(e.target.value)}
          required
          className="border rounded-lg p-2 focus:outline-blue-500"
        />

        {/* Método de pago */}
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          required
          className="border rounded-lg p-2 focus:outline-blue-500"
        >
          <option value="">Selecciona método de pago</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="efectivo">Efectivo</option>
        </select>

        {/* RFC */}
        <input
          type="text"
          placeholder="RFC"
          value={rfc}
          onChange={(e) => setRfc(e.target.value)}
          className="border rounded-lg p-2 focus:outline-blue-500"
        />

        {/* Requiere factura */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={requiresInvoice}
            onChange={(e) => setRequiresInvoice(e.target.checked)}
          />
          <span>Requiere factura</span>
        </label>

        {/* Nombre y dirección Lead */}
        <input
          type="text"
          placeholder="Nombre del cliente"
          value={clientName}
          readOnly
          className="border rounded-lg p-2 bg-gray-100"
        />
        <input
          type="text"
          placeholder="Dirección del cliente"
          value={clientAddress}
          readOnly
          className="border rounded-lg p-2 bg-gray-100"
        />

        {/* Monto total */}
        <input
          type="number"
          placeholder="Monto total"
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
          required
          min={0} // <- No permite negativos
          className="border rounded-lg p-2 focus:outline-blue-500"
        />

        {/* Estado */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "pending" | "completed")}
          className="border rounded-lg p-2 focus:outline-blue-500"
        >
          <option value="pending">Pendiente</option>
          <option value="completed">Completada</option>
        </select>

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 transition"
        >
          Crear Venta
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center font-semibold text-gray-700">{message}</p>
      )}
    </div>
  );
};

export default SaleForm;
