"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Target,
  MessageCircle,
  Plus,
  ArrowRight,
  Activity,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function DashboardPage() {
  const [stats, setStats] = useState([
    {
      title: "Total Ventas",
      value: "0",
      change: "+0%",
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      title: "Clientes",
      value: "0",
      change: "+0%",
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Productos",
      value: "0",
      change: "+0%",
      icon: Package,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
  ])

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient()
      
      try {
        
        const { count: salesCount } = await supabase
          .from('sales')
          .select('*', { count: 'exact', head: true })

       
        const { count: clientsCount } = await supabase
          .from('clientes')
          .select('*', { count: 'exact', head: true })

    
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })

        setStats([
          {
            title: "Total Ventas",
            value: salesCount?.toString() || "0",
            change: "+12.5%",
            icon: DollarSign,
            color: "text-emerald-600 dark:text-emerald-400",
            bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
          },
          {
            title: "Clientes",
            value: clientsCount?.toString() || "0",
            change: "+8.2%",
            icon: Users,
            color: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-100 dark:bg-blue-900/30",
          },
          {
            title: "Productos",
            value: productsCount?.toString() || "0",
            change: "+3.1%",
            icon: Package,
            color: "text-purple-600 dark:text-purple-400",
            bgColor: "bg-purple-100 dark:bg-purple-900/30",
          },
        ])
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
  }, [])

  const quickActions = [
    {
      title: "Nueva Venta",
      description: "Registrar una nueva venta",
      icon: Plus,
      href: "/admin/sales",
    },
    {
      title: "Agregar Cliente",
      description: "Registrar nuevo cliente",
      icon: Users,
      href: "/admin/clientes",
    },
    {
      title: "Gestionar Productos",
      description: "Administrar inventario",
      icon: Package,
      href: "/admin/productos",
    },
    {
      title: "Ver Mensajes",
      description: "Revisar comunicaciones",
      icon: MessageCircle,
      href: "/admin/mensajes",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Panel de administración empresarial</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{stat.change}</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader className="border-b border-gray-200 dark:border-gray-800 pb-4">
                <CardTitle className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Link key={index} href={action.href}>
                      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-blue-500 transition-all duration-200 cursor-pointer group h-fit">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <action.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {action.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg w-fit mx-auto">
                    <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">¡Bienvenido al Sistema!</h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                      Gestiona eficientemente tu negocio con nuestro panel de administración completo
                    </p>
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    <Button
                      className="h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm gap-2"
                      asChild
                    >
                      <Link href="/admin/sales">
                        <Plus className="h-4 w-4" />
                        Comenzar
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10 border-gray-300 dark:border-gray-700 hover:border-blue-500 gap-2 bg-transparent text-gray-700 dark:text-gray-300"
                      asChild
                    >
                      <Link href="/admin/mensajes">
                        <MessageCircle className="h-4 w-4" />
                        Soporte
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader className="border-b border-gray-200 dark:border-gray-800 pb-4">
                <CardTitle className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
                    <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Nueva venta registrada</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Hace 2 horas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Cliente agregado</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Hace 4 horas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-md">
                    <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Producto actualizado</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Ayer</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader className="border-b border-gray-200 dark:border-gray-800 pb-4">
                <CardTitle className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Métricas del Mes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Ventas completadas</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">87%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: "72%" }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Satisfacción cliente</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">94%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: "94%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
