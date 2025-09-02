"use client";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { LiaMoneyBillWaveSolid } from "react-icons/lia";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Home, Users, Building2, BarChart3, Settings } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard", icon: <Home size={18} /> },
    { href: "/admin/clientes", label: "Clientes", icon: <Users size={18} /> },
    { href: "/admin/sales_items", label: "Items", icon: <RiMoneyDollarCircleLine /> },
    { href: "/admin/sales_objectives", label: "Objetivo de ventas", icon: <BarChart3 size={18} /> },
    { href: "/admin/sales", label: "Ventas", icon: <LiaMoneyBillWaveSolid size={18}/> },
  ];

  return (
    <main className="min-h-screen flex bg-gray-50">
      {/* Sidebar oscuro */}
      <aside className="w-64 bg-gray-900 shadow-lg flex flex-col p-6">
        <h2 className="text-2xl font-bold text-white mb-8">Admin Panel</h2>
        <nav className="flex flex-col gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === link.href
                  ? "bg-blue-600 text-white font-medium"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {link.icon} {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Contenido principal */}
      <section className="flex-1 bg-gray-50 overflow-y-auto">{children}</section>
    </main>
  );
}
