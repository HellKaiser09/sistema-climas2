"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Building2, User, Mail, Lock, UserCheck } from "lucide-react"
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
    <div className="min-h-[85vh] bg-gradient-to-br from-tecmilenio-50 via-white to-tecmilenio-50 flex items-center justify-center p-4">
      {/* Background Pattern */}

      <div className="flex w-full mx-auto">
        {clientes.length > 0 && (
          <div className="mt-6 lg:w-1/2">
            <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Clientes Registrados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {clientes.map((cliente: any) => (
                  <div key={cliente.id} className="p-3 border rounded-md bg-gray-50 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{cliente.nombre}</p>
                      <p className="text-sm text-gray-500">{cliente.email}</p>
                      <p className="text-sm text-gray-500">{cliente.direccion}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="w-12 h-12 bg-tecmilenio rounded-xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Registro de Clientes</CardTitle>
              <p className="text-gray-600 mt-2">Crea tu cuenta en el sistema</p>
            </CardHeader>

            <CardContent className="space-y-6 ">
              {/* Lista de clientes */}

              <form onSubmit={handleRegistration} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Nombre completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-12 border-gray-200 focus:border-tecmilenio focus:ring-tecmilenio"
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
                      className="pl-10 h-12 border-gray-200 focus:border-tecmilenio focus:ring-tecmilenio"
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
                      className="pl-10 h-12 border-gray-200 focus:border-tecmilenio focus:ring-tecmilenio"
                      required
                    />
                  </div>

                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="direccion"
                      placeholder="Direccion"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      className="pl-10 h-12 border-gray-200 focus:border-tecmilenio focus:ring-tecmilenio"
                      required
                    />
                  </div>

                </div>



                <Button
                  type="submit"
                  className="w-full h-12 bg-tecmilenio hover:bg-tecmilenio-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
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

              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  ¿Ya tienes cuenta?{" "}
                  <Link
                    href="/login"
                    className="text-tecmilenio hover:text-tecmilenio-700 font-medium"
                  >
                    Iniciar sesión
                  </Link>
                </p>
              </div>

              {msg && (
                <div className="text-center">
                  <p className={`text-sm ${msg.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                    {msg}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mobile Branding */}
          <div className="lg:hidden text-center mt-8">
            <p className="text-gray-600">Rodzak S.A de C.V</p>
          </div>
        </div>
      </div>

    </div>
  )
}
