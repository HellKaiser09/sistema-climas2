"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { createSalesObjective, getUsers, getSalesObjectives } from "../../../lib/supabase/sales_objectives"
import { Target, User, Calendar, TrendingUp, DollarSign, Users, CheckCircle, AlertCircle, Sparkles, BarChart3, Plus, Edit, Trash2 } from
"lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface SalesObjectiveWithUser {
  id: number
  user_id: string
  month: number
  year: number
  leads_target: number
  sales_target: number
  sales_target_type: string
  sales_target_value: number
  created_at: string
  users: { name: string }
}

export default function SalesObjectivePage() {
  const [users, setUsers] = useState<{ id: string; name: string }[]>([])
  const [objectives, setObjectives] = useState<SalesObjectiveWithUser[]>([])
  const [showForm, setShowForm] = useState(false)
  const [userId, setUserId] = useState("")
  const [month, setMonth] = useState<number | "">("")
  const [year, setYear] = useState<number | "">("")
  const [leadsTarget, setLeadsTarget] = useState<number | "">("")
  const [salesTarget, setSalesTarget] = useState<number | "">("")
  const [salesTargetValue, setSalesTargetValue] = useState<number | "">("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [usersData, objectivesData] = await Promise.all([
        getUsers(),
        getSalesObjectives()
      ])
      setUsers(usersData)
      setObjectives(objectivesData)
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!userId || month === "" || year === "" || leadsTarget === "" ||
      salesTarget === "" || salesTargetValue === "") {
      setMessage("Completa todos los campos")
      setIsLoading(false)
      return
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
      })
      setMessage("Objetivo creado exitosamente")
      // reset
      setUserId("")
      setMonth("")
      setYear("")
      setLeadsTarget("")
      setSalesTarget("")
      setSalesTargetValue("")
      setShowForm(false)
      loadData() // Recargar datos
    } catch (error: any) {
      console.error(error)
      setMessage(`Error guardando: ${error.message || "Revisa la consola"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  return (
    <div className="bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-lg font-medium text-foreground">Objetivos de Venta</h1>
            <Button
              onClick={() => setShowForm(true)}
              className="ml-auto h-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm px-3 text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Agregar Objetivo
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Define y gestiona metas para el equipo de ventas</p>
        </div>

          {/* Tabla principal */}
          <div className="lg:col-span-3">
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50">
                        <TableHead className="text-muted-foreground font-medium">Usuario</TableHead>
                        <TableHead className="text-muted-foreground font-medium">Período</TableHead>
                        <TableHead className="text-muted-foreground font-medium">Meta Leads</TableHead>
                        <TableHead className="text-muted-foreground font-medium">Meta Ventas</TableHead>
                        <TableHead className="text-muted-foreground font-medium">Meta Ingresos</TableHead>
                        <TableHead className="text-muted-foreground font-medium">Fecha Creación</TableHead>
                        <TableHead className="text-muted-foreground font-medium w-20">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {objectives.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            <div className="flex flex-col items-center gap-2">
                              <Target className="h-8 w-8 text-muted-foreground/50" />
                              <p>No hay objetivos de venta registrados</p>
                              <Button
                                onClick={() => setShowForm(true)}
                                variant="outline"
                                size="sm"
                                className="mt-2"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Crear primer objetivo
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        objectives.map((objective) => (
                          <TableRow key={objective.id} className="border-border/50 hover:bg-muted/30">
                            <TableCell className="font-medium text-foreground">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                  <User className="w-4 h-4 text-primary" />
                                </div>
                                {objective.users.name}
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {monthNames[objective.month - 1]} {objective.year}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              <Badge variant="outline" className="border-blue-500/20 text-blue-600 bg-blue-500/10">
                                {objective.leads_target} leads
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              <Badge variant="outline" className="border-green-500/20 text-green-600 bg-green-500/10">
                                {objective.sales_target} ventas
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground font-medium">
                              {formatCurrency(objective.sales_target_value)}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {new Date(objective.created_at).toLocaleDateString('es-MX')}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-blue-500/10 hover:text-blue-600"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal del formulario */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <Card className="border-0 shadow-none">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="text-lg font-medium text-foreground flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Crear Nuevo Objetivo
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowForm(false)}
                      className="h-8 w-8 p-0"
                    >
                      ✕
                    </Button>
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* User Selection */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <User className="h-4 w-4" />
                        Usuario Asignado
                      </Label>
                      <Select value={userId} onValueChange={setUserId}>
                        <SelectTrigger className="h-10 border-border/50 focus:border-primary">
                          <SelectValue placeholder="Selecciona un usuario..." />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Period Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <Calendar className="h-4 w-4" />
                          Mes
                        </Label>
                        <Select value={month.toString()} onValueChange={(value) => setMonth(Number(value))}>
                          <SelectTrigger className="h-10 border-border/50 focus:border-primary">
                            <SelectValue placeholder="Selecciona mes..." />
                          </SelectTrigger>
                          <SelectContent>
                            {monthNames.map((monthName, index) => (
                              <SelectItem key={index + 1} value={(index + 1).toString()}>
                                {monthName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <Calendar className="h-4 w-4" />
                          Año
                        </Label>
                        <Input
                          type="number"
                          placeholder="2025"
                          value={year}
                          min={2025}
                          max={2050}
                          onChange={(e) => setYear(Number(e.target.value))}
                          className="h-10 border-border/50 focus:border-primary"
                        />
                      </div>
                    </div>

                    {/* Targets */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <Users className="h-4 w-4" />
                          Meta de Leads
                        </Label>
                        <Input
                          type="number"
                          placeholder="Número de leads objetivo..."
                          value={leadsTarget}
                          min={1}
                          onChange={(e) => setLeadsTarget(Number(e.target.value))}
                          className="h-10 border-border/50 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <TrendingUp className="h-4 w-4" />
                          Meta de Ventas (Cantidad)
                        </Label>
                        <Input
                          type="number"
                          placeholder="Número de ventas objetivo..."
                          value={salesTarget}
                          min={1}
                          onChange={(e) => setSalesTarget(Number(e.target.value))}
                          className="h-10 border-border/50 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <DollarSign className="h-4 w-4" />
                          Meta de Ingresos
                        </Label>
                        <Input
                          type="number"
                          placeholder="Valor monetario objetivo..."
                          value={salesTargetValue}
                          min={1}
                          onChange={(e) => setSalesTargetValue(Number(e.target.value))}
                          className="h-10 border-border/50 focus:border-primary"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowForm(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading || !userId || !month || !year || !leadsTarget || !salesTarget || !salesTargetValue}
                        className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-medium shadow-sm"
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2"></div>
                            Creando...
                          </div>
                        ) : (
                          "Crear Objetivo"
                        )}
                      </Button>
                    </div>
                  </form>

                  {/* Message Display */}
                  {message && (
                    <div className={`mt-4 p-3 rounded-lg flex items-center gap-3 ${
                      message.includes("exitosamente")
                        ? "bg-green-500/10 border border-green-500/20 text-green-600"
                        : "bg-red-500/10 border border-red-500/20 text-red-600"
                    }`}>
                      {message.includes("exitosamente") ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <p className="font-medium text-sm">{message}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
  )
}
