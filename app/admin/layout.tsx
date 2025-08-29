"use client";
import React from "react";
import { Home, Users, Building2, BarChart3, Settings } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex bg-gray-100">
      {/* Sidebar fijo */}
      <aside className="w-64 bg-white shadow-lg flex flex-col p-6">
        <h2 className="text-2xl font-bold text-blue-600 mb-8">Admin Panel</h2>
        <nav className="flex flex-col gap-4 text-gray-700">
          <Link href="/admin" className="flex items-center gap-2 hover:text-blue-600">
            <Home size={18} /> Dashboard
          </Link>
          <Link href="/admin/clientes" className="flex items-center gap-2 hover:text-blue-600">
            <Users size={18} /> Clientes
          </Link>
          <Link href="/admin/empresas" className="flex items-center gap-2 hover:text-blue-600">
            <Building2 size={18} /> Empresas
          </Link>
          <Link href="/admin/reportes" className="flex items-center gap-2 hover:text-blue-600">
            <BarChart3 size={18} /> Reportes
          </Link>
          <Link href="/admin/configuracion" className="flex items-center gap-2 hover:text-blue-600">
            <Settings size={18} /> Configuración
          </Link>
        </nav>
      </aside>

      {/* Contenido dinámico */}
      <section className="flex-1 p-8 overflow-y-auto">
        {children}
      </section>
    </main>
  );
}