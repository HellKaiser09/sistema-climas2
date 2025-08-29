"use client";
import React from "react";

export default function DashboardPage() {
  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <input
          type="text"
          placeholder="Buscar..."
          className="border rounded-lg px-4 py-2 text-sm"
        />
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-red-500">
          <h3 className="text-gray-600 font-medium">Clientes</h3>
          <p className="text-3xl font-bold mt-2">250k</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
          <h3 className="text-gray-600 font-medium">Clientes Activos</h3>
          <p className="text-3xl font-bold mt-2">24m</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-yellow-500">
          <h3 className="text-gray-600 font-medium">Productos</h3>
          <p className="text-3xl font-bold mt-2">15k</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
          <h3 className="text-gray-600 font-medium">Ingresos</h3>
          <p className="text-3xl font-bold mt-2">180m</p>
        </div>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6 h-64 flex items-center justify-center text-gray-400">
          <p>📊 Gráfica de ventas</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 h-64 flex items-center justify-center text-gray-400">
          <p>📈 Gráfica de ingresos</p>
        </div>
      </div>

      {/* Tabla de participantes */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold mb-4">Lista de Participantes</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left border-b bg-gray-50">
              <th className="py-2 px-4">Nombre</th>
              <th className="py-2 px-4">Matrícula</th>
              <th className="py-2 px-4">Carrera</th>
              <th className="py-2 px-4">Campus</th>
              <th className="py-2 px-4">Tipo</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2 px-4">Juan Pérez</td>
              <td className="py-2 px-4">A00123</td>
              <td className="py-2 px-4">Ingeniería</td>
              <td className="py-2 px-4">Campus Norte</td>
              <td className="py-2 px-4">Estudiante</td>
            </tr>
            <tr>
              <td className="py-2 px-4">María López</td>
              <td className="py-2 px-4">A00456</td>
              <td className="py-2 px-4">Diseño</td>
              <td className="py-2 px-4">Campus Sur</td>
              <td className="py-2 px-4">Estudiante</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
