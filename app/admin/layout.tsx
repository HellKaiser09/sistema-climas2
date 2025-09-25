"use client"
import { RiMoneyDollarCircleLine } from "react-icons/ri"
import { LiaMoneyBillWaveSolid } from "react-icons/lia"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type React from "react"
import { Home, Users, Building2, BarChart3, PackageSearch, Settings, Bell } from "lucide-react"
import ThemeToggle from "@/components/ThemeToggle"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const links = [
    { href: "/admin", label: "Dashboard", icon: <Home size={20} /> },
    { href: "/admin/productos", label: "Productos", icon: <PackageSearch size={20} /> },
    { href: "/admin/clientes", label: "Clientes", icon: <Users size={20} /> },
    { href: "/admin/sales_objectives", label: "Objetivo de ventas", icon: <BarChart3 size={20} /> },
    { href: "/admin/sales", label: "Ventas", icon: <LiaMoneyBillWaveSolid size={20} /> },
    { href: "/admin/sales_items", label: "Items", icon: <RiMoneyDollarCircleLine size={20} /> },
    { href: "/admin/mensajes", label: "Mensajes", icon: <Building2 size={20} /> },
  ]

  return (
    <main className="min-h-screen flex bg-white dark:bg-gray-950 text-black dark:text-white">
      {/* Sidebar */}
      <aside className="w-72 bg-white dark:bg-gray-950 flex flex-col border-r border-gray-200 dark:border-gray-800">
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-8 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            <h1 className="text-2xl font-semibold tracking-tight">Admin Panel</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Gestión empresarial</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 bg-white dark:bg-gray-950">
            <div className="space-y-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                    pathname === link.href
                      ? "bg-gray-100 dark:bg-gray-900 text-black dark:text-white shadow-sm"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <span className="flex-shrink-0">{link.icon}</span>
                  <span className="truncate">{link.label}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
              <Settings size={18} />
              <span className="text-sm font-medium">Configuración</span>
            </div>
          </div>
        </div>
      </aside>

      <section className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Espacio para elementos del lado izquierdo si se necesitan */}
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-white dark:bg-gray-950 p-8 text-black dark:text-white">{children}</main>
      </section>
    </main>
  )
}
