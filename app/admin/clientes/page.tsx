"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { UserPlus, User, Mail, Lock, Building2, Plus, Edit, Save, X, Trash2, Users } from "lucide-react"
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Gestión de Clientes</h1>
              <p className="text-sm text-muted-foreground">Administra y registra nuevos clientes</p>
            </div>
          </div>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {clientes.length > 0 && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-lg font-medium text-foreground">
              Clientes Registrados ({clientes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead className="font-medium text-muted-foreground">Nombre</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Email</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Dirección</TableHead>
                  <TableHead className="text-right font-medium text-muted-foreground">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((cliente) => (
                  <TableRow key={cliente.id} className="border-border/50 hover:bg-muted/30 transition-colors">
                    <TableCell className="py-4">
                      {editingId === cliente.id ? (
                        <Input
                          value={editingData.nombre || ""}
                          onChange={(e) => setEditingData({ ...editingData, nombre: e.target.value })}
                          className="h-8 text-sm border-border/50 focus:border-primary"
                        />
                      ) : (
                        <div className="font-medium text-foreground">{cliente.nombre}</div>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      {editingId === cliente.id ? (
                        <Input
                          value={editingData.email || ""}
                          onChange={(e) => setEditingData({ ...editingData, email: e.target.value })}
                          className="h-8 text-sm border-border/50 focus:border-primary"
                        />
                      ) : (
                        <div className="text-muted-foreground">{cliente.email}</div>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      {editingId === cliente.id ? (
                        <Input
                          value={editingData.direccion || ""}
                          onChange={(e) => setEditingData({ ...editingData, direccion: e.target.value })}
                          className="h-8 text-sm border-border/50 focus:border-primary"
                        />
                      ) : (
                        <div className="text-muted-foreground">{cliente.direccion}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right py-4">
                      <div className="flex justify-end gap-2">
                        {editingId === cliente.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => saveEdit(cliente.id)}
                              className="h-8 w-8 p-0 border-border/50 hover:bg-primary hover:text-primary-foreground"
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditing}
                              className="h-8 w-8 p-0 border-border/50 hover:bg-muted bg-transparent"
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
                              className="h-8 w-8 p-0 border-border/50 hover:bg-muted"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteCliente(cliente.id)}
                              className="h-8 w-8 p-0 border-border/50 hover:bg-destructive hover:text-destructive-foreground"
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

      {clientes.length === 0 && (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No hay clientes registrados</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">Comienza agregando tu primer cliente al sistema</p>
            <Button onClick={() => setOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Registrar Primer Cliente
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md border-border/50">
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center pb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold text-foreground">Nuevo Cliente</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">Registra un nuevo cliente en el sistema</p>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleRegistration} className="space-y-4">
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Nombre completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-11 border-border/50 focus:border-primary bg-background"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      type="email"
                      placeholder="Correo electrónico"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 border-border/50 focus:border-primary bg-background"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      type="password"
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-11 border-border/50 focus:border-primary bg-background"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Dirección"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      className="pl-10 h-11 border-border/50 focus:border-primary bg-background"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                      Registrando...
                    </div>
                  ) : (
                    "Registrar Cliente"
                  )}
                </Button>
              </form>

              <div className="text-center pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  ¿Ya tienes cuenta?{" "}
                  <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
                    Iniciar sesión
                  </Link>
                </p>
              </div>

              {msg && (
                <div className="text-center">
                  <p className={`text-sm ${msg.includes("Error") ? "text-destructive" : "text-primary"}`}>{msg}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  )
}
