"use client";
import React from "react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Panel de administración</p>
        </div>
        
        {/* Contenido principal con fondo blanco */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Bienvenido al Panel de Administración</h2>
            <p className="text-gray-500">Aquí puedes gestionar todos los aspectos del sistema</p>
          </div>
        </div>
      </div>
    </div>
  );
}
