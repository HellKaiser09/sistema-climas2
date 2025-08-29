"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Shield, Mail, Lock, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success("Inicio de sesión exitoso")
      const returnPath = localStorage.getItem("returnPath") || "/admin"
      localStorage.removeItem("returnPath")
      router.push(returnPath)
    } catch (error) {
      toast.error("Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (

    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader className="text-center border-b border-gray-100">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Iniciar Sesión</CardTitle>
            <p className="text-gray-600 mt-2">Accede al panel administrativo</p>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-6">
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

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Iniciando sesión...
                  </div>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>

            <div className="text-center pt-6 border-t border-gray-100 mt-6">
              <p className="text-sm text-gray-500">
                ¿Problemas para acceder?{" "}
                <a
                  href="mailto:soporte@tecmilenio.mx"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Contacta soporte
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Branding */}
        <div className="text-center mt-8">
          <p className="text-gray-500">Rodzak S.A de C.V</p>
        </div>
      </div>
    </div>
  )
}
