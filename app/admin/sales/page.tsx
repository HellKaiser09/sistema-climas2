"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, Plus, UserIcon, Calendar, CreditCard, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { saveSale } from "@/lib/supabase/sales"
import { supabaseClient } from "@/lib/supabase/client"

interface Lead {
  id: string
  name: string
  lastname: string
  address: string
}

interface Salesperson {
  id: string
  name: string
}

interface Technician {
  id: string
  availability_status: string
}

const SaleForm = () => {
  const [leads, setLeads] = useState<Lead[]>([])
  const [salespersons, setSalespersons] = useState<Salesperson[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])

  const [sales, setSales] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [leadId, setLeadId] = useState("")
  const [salespersonId, setSalespersonId] = useState("")
  const [technicianId, setTechnicianId] = useState("")
  const [serviceDate, setServiceDate] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [rfc, setRfc] = useState("")
  const [requiresInvoice, setRequiresInvoice] = useState(false)
  const [clientName, setClientName] = useState("")
  const [clientAddress, setClientAddress] = useState("")
  const [totalAmount, setTotalAmount] = useState<number | string>(0)
  const [status, setStatus] = useState<"pending" | "completed">("pending")
  const [message, setMessage] = useState("")

  const fetchSales = async () => {
    const { data: salesData } = await supabaseClient.from("sales").select("*")

    if (salesData) setSales(salesData)
  }

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      const { data: leadData } = await supabaseClient.from("leads").select("id, name, lastname, address")
      const { data: salespersonData } = await supabaseClient.from("users").select("id, name")
      const { data: techData } = await supabaseClient.from("technicians").select("id, availability_status")

      if (leadData) setLeads(leadData)
      if (salespersonData) setSalespersons(salespersonData)
      if (techData) setTechnicians(techData)
    }
    fetchSales()
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!leadId || !salespersonId || !technicianId) {
      setMessage("Selecciona Lead, Vendedor y Técnico")
      return
    }

    const serviceDateISO = new Date(serviceDate).toISOString()
    const serviceDateOnly = serviceDateISO.split("T")[0]
    const amountNum = Number(totalAmount)

    if (amountNum < 0) {
      setMessage("El monto total no puede ser negativo")
      return
    }

    try {
      // Guardar venta
      await saveSale({
        lead_id: leadId,
        salesperson_id: salespersonId,
        technician_id: technicianId,
        service_date: serviceDateISO,
        payment_method: paymentMethod,
        rfc,
        requires_invoice: requiresInvoice,
        client_name: clientName,
        client_address: clientAddress,
        total_amount: amountNum,
        status,
      })

      setMessage("Venta creada exitosamente")

      // Reset formulario
      setLeadId("")
      setSalespersonId("")
      setTechnicianId("")
      setServiceDate("")
      setPaymentMethod("")
      setRfc("")
      setRequiresInvoice(false)
      setClientName("")
      setClientAddress("")
      setTotalAmount(0)
      setStatus("pending")

      setOpen(false)
      fetchSales()
    } catch (error: any) {
      console.error(error)
      setMessage(`Error: ${error.message || "Revisa la consola"}`)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Ventas</h1>
          <p className="text-gray-600 mt-1">Registra y administra las ventas de tu negocio</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Venta
        </Button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg border ${
            message.includes("Error")
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-green-50 border-green-200 text-green-800"
          }`}
        >
          <p className="font-medium">{message}</p>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-white rounded-lg shadow-xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
              <Plus className="w-6 h-6 mr-2 text-blue-600" />
              Registrar Nueva Venta
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lead Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center">
                  <UserIcon className="w-4 h-4 mr-2" />
                  Lead
                </Label>
                <Select
                  value={leadId}
                  onValueChange={(value) => {
                    const selected = leads.find((l) => l.id === value)
                    setLeadId(value)
                    if (selected) {
                      setClientName(`${selected.name} ${selected.lastname}`)
                      setClientAddress(selected.address)
                    } else {
                      setClientName("")
                      setClientAddress("")
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un Lead" />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name} {l.lastname} — {l.id.slice(0, 8)}…
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* User Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Vendedor</Label>
                <Select value={salespersonId} onValueChange={setSalespersonId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un Usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {salespersons.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} — {u.id.slice(0, 8)}…
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Technician Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Técnico</Label>
                <Select value={technicianId} onValueChange={setTechnicianId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un Técnico" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.availability_status} — {t.id.slice(0, 8)}…
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Fecha de Servicio
                </Label>
                <Input
                  type="datetime-local"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Método de Pago
                </Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona método de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Total Amount */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Monto Total</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  required
                  min={0}
                  className="w-full"
                />
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Información de Facturación
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">RFC</Label>
                  <Input
                    type="text"
                    placeholder="RFC del cliente"
                    value={rfc}
                    onChange={(e) => setRfc(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Estado</Label>
                  <Select value={status} onValueChange={(value: "pending" | "completed") => setStatus(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="completed">Completada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="requiresInvoice" checked={requiresInvoice} onCheckedChange={() => setRequiresInvoice(!requiresInvoice)} />
                <Label htmlFor="requiresInvoice" className="text-sm font-medium text-gray-700">
                  Requiere factura
                </Label>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Información del Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Nombre</Label>
                  <Input
                    value={clientName}
                    readOnly
                    className="bg-gray-50 text-gray-600"
                    placeholder="Se completará automáticamente"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Dirección</Label>
                  <Input
                    value={clientAddress}
                    readOnly
                    className="bg-gray-50 text-gray-600"
                    placeholder="Se completará automáticamente"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Crear Venta
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-xl text-gray-900">Ventas Registradas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {sales.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No hay ventas registradas</p>
              <p className="text-sm">Haz clic en "Nueva Venta" para comenzar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-900">Cliente</TableHead>
                    <TableHead className="font-semibold text-gray-900">Vendedor</TableHead>
                    <TableHead className="font-semibold text-gray-900">Técnico</TableHead>
                    <TableHead className="font-semibold text-gray-900">Fecha</TableHead>
                    <TableHead className="font-semibold text-gray-900">Pago</TableHead>
                    <TableHead className="font-semibold text-gray-900">Monto</TableHead>
                    <TableHead className="font-semibold text-gray-900">Estado</TableHead>
                    <TableHead className="font-semibold text-gray-900">Factura</TableHead>
                    <TableHead className="text-right font-semibold text-gray-900">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale, i) => (
                    <TableRow key={sale.id + i} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">{sale.client_name}</TableCell>
                      <TableCell className="text-gray-600">{sale.salesperson_id}</TableCell>
                      <TableCell className="text-gray-600">{sale.technician_id}</TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(sale.service_date).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="capitalize text-gray-600">{sale.payment_method}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ${Number(sale.total_amount).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={sale.status === "completed" ? "default" : "secondary"}
                          className={
                            sale.status === "completed"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          }
                        >
                          {sale.status === "completed" ? "Completada" : "Pendiente"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={sale.requires_invoice ? "default" : "outline"}
                          className={sale.requires_invoice ? "bg-blue-100 text-blue-800" : ""}
                        >
                          {sale.requires_invoice ? "Sí" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 bg-transparent"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SaleForm
