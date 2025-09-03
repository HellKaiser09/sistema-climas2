"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { UserPlus, User, Mail, Lock, Building2, Plus, Edit, Save, X, Trash2 } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Cliente {
  id: number
  nombre: string
  email: string
  direccion: string
  creado_en?: string
}

export default function UserRegistration() {
  const [open, setOpen] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const router = useRouter()
  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [msg, setMsg] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [direccion, setDireccion] = useState<string>("")

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingData, setEditingData] = useState<Partial<Cliente>>({})

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (authError) throw authError

      // Si el registro de auth fue exitoso, insertar en la tabla clientes
      if (authData.user) {
        const { error: clientError } = await supabase.from("clientes").insert({
          nombre: name,
          email: email,
          direccion: direccion,
        })

        if (clientError) {
          console.error("Error al insertar cliente:", clientError)
          throw new Error("Error al crear el perfil del cliente")
        }
      }
      fetchClientes()
      toast.success("Registro exitoso")
      setMsg("Cliente registrado correctamente")
      setName("")
      setEmail("")
      setPassword("")
      setDireccion("")
      setOpen(false)
    } catch (error) {
      console.error("Error en el registro:", error)
      toast.error("Error al registrar cliente")
      setMsg("Error en el registro")
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchClientes() {
    const supabase = createClient()
    const { data, error } = await supabase.from("clientes").select("*")
    if (error) {
      console.error("Error al obtener clientes:", error)
      return
    }
    setClientes(data as Cliente[])
  }

  const startEditing = (cliente: Cliente) => {
    setEditingId(cliente.id)
    setEditingData({
      nombre: cliente.nombre,
      email: cliente.email,
      direccion: cliente.direccion,
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingData({})
  }

  const saveEdit = async (id: number) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("clientes").update(editingData).eq("id", id)

      if (error) throw error

      toast.success("Cliente actualizado correctamente")
      setEditingId(null)
      setEditingData({})
      fetchClientes()
    } catch (error) {
      console.error("Error al actualizar cliente:", error)
      toast.error("Error al actualizar cliente")
    }
  }

  const deleteCliente = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este cliente?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("clientes").delete().eq("id", id)

      if (error) throw error

      toast.success("Cliente eliminado correctamente")
      fetchClientes()
    } catch (error) {
      console.error("Error al eliminar cliente:", error)
      toast.error("Error al eliminar cliente")
    }
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
            <Button size="sm" onClick={() => setOpen(true)} className="h-8">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-1">Registro y administración de clientes</p>
        </div>

        {clientes.length > 0 && (
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader className="border-b border-gray-100 py-3">
              <CardTitle className="text-lg font-semibold text-gray-900">Clientes Registrados</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="h-10">
                    <TableHead className="py-2 text-xs font-medium">Nombre</TableHead>
                    <TableHead className="py-2 text-xs font-medium">Email</TableHead>
                    <TableHead className="py-2 text-xs font-medium">Dirección</TableHead>
                    <TableHead className="text-right py-2 text-xs font-medium">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.map((cliente) => (
                    <TableRow key={cliente.id} className="h-12">
                      <TableCell className="py-2">
                        {editingId === cliente.id ? (
                          <Input
                            value={editingData.nombre || ""}
                            onChange={(e) => setEditingData({ ...editingData, nombre: e.target.value })}
                            className="h-7 text-sm"
                          />
                        ) : (
                          <span className="text-sm">{cliente.nombre}</span>
                        )}
                      </TableCell>
                      <TableCell className="py-2">
                        {editingId === cliente.id ? (
                          <Input
                            value={editingData.email || ""}
                            onChange={(e) => setEditingData({ ...editingData, email: e.target.value })}
                            className="h-7 text-sm"
                          />
                        ) : (
                          <span className="text-sm">{cliente.email}</span>
                        )}
                      </TableCell>
                      <TableCell className="py-2">
                        {editingId === cliente.id ? (
                          <Input
                            value={editingData.direccion || ""}
                            onChange={(e) => setEditingData({ ...editingData, direccion: e.target.value })}
                            className="h-7 text-sm"
                          />
                        ) : (
                          <span className="text-sm">{cliente.direccion}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right py-2">
                        <div className="flex justify-end gap-1">
                          {editingId === cliente.id ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => saveEdit(cliente.id)}
                                className="h-7 w-7 p-0"
                              >
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEditing}
                                className="h-7 w-7 p-0 bg-transparent"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEditing(cliente)}
                                className="h-7 w-7 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteCliente(cliente.id)}
                                className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Formulario de registro */}
        <Dialog open={open} onOpenChange={() => setOpen(!open)}>
          <DialogContent className="max-w-md">
            <div>
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="text-center border-b border-gray-100 pb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Registro de Clientes</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Crea tu cuenta en el sistema</p>
                </CardHeader>

                <CardContent className="p-4">
                  <form onSubmit={handleRegistration} className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Nombre completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-9 h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-sm"
                        required
                      />
                    </div>

                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9 h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-sm"
                        required
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-9 h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-sm"
                        required
                      />
                    </div>

                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Dirección"
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                        className="pl-9 h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-sm"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Registrando...
                        </div>
                      ) : (
                        "Registrar Cliente"
                      )}
                    </Button>
                  </form>

                  <div className="text-center pt-4 border-t border-gray-100 mt-4">
                    <p className="text-xs text-gray-500">
                      ¿Ya tienes cuenta?{" "}
                      <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                        Iniciar sesión
                      </Link>
                    </p>
                  </div>

                  {msg && (
                    <div className="text-center mt-3">
                      <p className={`text-xs ${msg.includes("Error") ? "text-red-600" : "text-green-600"}`}>{msg}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
