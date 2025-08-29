"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Home, Users, Building2, BarChart3, Settings } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard", icon: <Home size={18} /> },
    { href: "/admin/clientes", label: "Clientes", icon: <Users size={18} /> },
    { href: "/admin/empresas", label: "Empresas", icon: <Building2 size={18} /> },
    { href: "/admin/reportes", label: "Reportes", icon: <BarChart3 size={18} /> },
    { href: "/admin/configuracion", label: "Configuración", icon: <Settings size={18} /> },
  ];

  return (
    <main className="min-h-screen flex bg-gray-100">
      {/* Sidebar fijo */}
      <aside className="w-64 bg-white shadow-lg flex flex-col p-6">
        <h2 className="text-2xl font-bold text-blue-600 mb-8">Admin Panel</h2>
        <nav className="flex flex-col gap-4 text-gray-700">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-2 py-2 rounded-lg transition ${
                pathname === link.href
                  ? "bg-blue-100 text-blue-600 font-semibold"
                  : "hover:bg-gray-100"
              }`}
            >
              {link.icon} {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Contenido dinámico */}
      <section className="flex-1 p-8 overflow-y-auto">{children}</section>
    </main>
  );
}
