"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { UserPlus, User, Mail, Lock, Building2 } from "lucide-react"
import Link from "next/link"

export default function UserRegistration() {
  const [clientes, setClientes] = useState([]);
  const router = useRouter()
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [msg, setMsg] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [direccion, setDireccion] = useState<string>("");

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
            name
          }
        }
      })

      if (authError) throw authError

      // Si el registro de auth fue exitoso, insertar en la tabla clientes
      if (authData.user) {
        const { error: clientError } = await supabase
          .from('clientes')
          .insert({
            nombre: name,
            email: email,
            direccion: direccion,

            // Remover completamente la línea de created_at ya que 'creado_en' tiene valor por defecto
          })

        if (clientError) {
          console.error('Error al insertar cliente:', clientError)
          throw new Error('Error al crear el perfil del cliente')
        }
      }
      fetchClientes()
      toast.success("Registro exitoso")
      setMsg("Cliente registrado correctamente")
    } catch (error) {
      console.error('Error en el registro:', error)
      toast.error("Error al registrar cliente")
      setMsg("Error en el registro")
    } finally {
      setIsLoading(false)
    }
  }
  async function fetchClientes() {
    const supabase = createClient()
    const { data, error } = await supabase.from('clientes').select('*')
    if (error) {
      console.error('Error al obtener clientes:', error)
      return
    }
    setClientes(data as any)
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Clientes</h1>
          <p className="text-gray-600">Registro y administración de clientes</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Lista de clientes */}
          {clientes.length > 0 && (
            <div>
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-xl font-semibold text-gray-900">Clientes Registrados</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {clientes.map((cliente: any) => (
                      <div key={cliente.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div>
                          <p className="font-semibold text-gray-900">{cliente.nombre}</p>
                          <p className="text-sm text-gray-600 mt-1">{cliente.email}</p>
                          <p className="text-sm text-gray-600">{cliente.direccion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Formulario de registro */}
          <div>
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="text-center border-b border-gray-100">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Registro de Clientes</CardTitle>
                <p className="text-gray-600 mt-2">Crea tu cuenta en el sistema</p>
              </CardHeader>

              <CardContent className="p-6">
                <form onSubmit={handleRegistration} className="space-y-6">
                  <div className="space-y-2">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type="text"
                        placeholder="Nombre completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type="text"
                        placeholder="Dirección"
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                        className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Registrando...
                      </div>
                    ) : (
                      "Registrar Cliente"
                    )}
                  </Button>
                </form>

                <div className="text-center pt-6 border-t border-gray-100 mt-6">
                  <p className="text-sm text-gray-500">
                    ¿Ya tienes cuenta?{" "}
                    <Link
                      href="/login"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Iniciar sesión
                    </Link>
                  </p>
                </div>

                {msg && (
                  <div className="text-center mt-4">
                    <p className={`text-sm ${msg.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                      {msg}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
