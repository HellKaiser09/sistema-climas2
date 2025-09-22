"use client"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Mail,
  Users,
  Package,
  CreditCard,
  BarChart3,
  Settings,
  HelpCircle,
  Target,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Message {
  id: string
  content: string
  isBot: boolean
  timestamp: Date
}

interface ContactMessage {
  email: string
  message: string
  timestamp: string
}

const botResponses = {
  greeting: "¡Hola! 👋 Soy el asistente virtual de tu dashboard de gestión empresarial. ¿En qué puedo ayudarte hoy?",

  features: `Nuestro sistema incluye:
  
📊 **Dashboard Analytics** - Métricas en tiempo real de tu negocio
👥 **Gestión de Clientes** - Registro y administración de clientes
💰 **Gestión de Ventas** - Control completo de ventas y facturación
📦 **Inventario de Productos** - Administración de stock y precios
🎯 **Objetivos de Venta** - Seguimiento de metas y rendimiento
📈 **Reportes** - Análisis detallados de tu negocio`,

  sales: `Gestión de Ventas:
  
✅ Registro de ventas con leads, vendedores y técnicos
✅ Control de fechas de servicio y métodos de pago
✅ Facturación automática con RFC
✅ Estados de venta (pendiente/completada)
✅ Integración con base de datos en tiempo real`,

  products: `Gestión de Productos:
  
✅ Catálogo completo de productos
✅ Control de stock y precios
✅ Categorización de productos
✅ Estados activo/inactivo
✅ Edición rápida desde la tabla`,

  clients: `Gestión de Clientes:
  
✅ Registro de clientes con datos completos
✅ Direcciones y información de contacto
✅ Historial de interacciones
✅ Integración con sistema de ventas`,

  analytics: `Dashboard Analytics:
  
📈 Métricas de rendimiento en tiempo real
📊 Gráficos de ventas y tendencias
💹 KPIs principales del negocio
🎯 Seguimiento de objetivos
📋 Reportes personalizables`,

  contact:
    "Para más información detallada o soporte técnico, simplemente escribe tu email en el chat y te contactaremos pronto.",

  help: `Comandos disponibles:
  
• "características" o "features" - Ver todas las funcionalidades
• "ventas" - Información sobre gestión de ventas  
• "productos" - Detalles del inventario
• "clientes" - Gestión de clientes
• "analytics" - Dashboard y reportes
• "contacto" - Información de contacto
• "ayuda" - Ver esta lista de comandos

💡 Tip:Escribe tu email en cualquier momento para que te contactemos`,

  thankYou:
    "✅ ¡Gracias! Te escribiremos pronto. Hemos recibido tu información y nuestro equipo se pondrá en contacto contigo para brindarte más detalles sobre nuestro sistema de gestión empresarial.",

  politeResponse: "Muchas gracias, esperamos verte pronto. ¡Que tengas un excelente día!",
  inappropriateResponse: "Sin tanta saliva, que no es mamada 😏 Mantengamos la conversación profesional. ¿En qué puedo ayudarte con el sistema?",
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: botResponses.greeting,
      isBot: true,
      timestamp: new Date(),
    },
  ])

  const [inputMessage, setInputMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()

    const emailMatch = userMessage.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
    
    if (message.includes("pito") || message.includes("mamada")) {
      return botResponses.inappropriateResponse
    }

    if (emailMatch && isValidEmail(emailMatch[0])) {
      handleAutoContactSave(emailMatch[0], userMessage)
      return botResponses.thankYou
    }

    if (
      message.includes("gracias") ||
      message.includes("thank you") ||
      message.includes("thanks") ||
      message.includes("muchas gracias") ||
      message.includes("te agradezco") ||
      message.includes("agradezco") ||
      message.includes("excelente") ||
      message.includes("perfecto") ||
      message.includes("genial") ||
      message.includes("muy bien") ||
      message.includes("buenísimo") ||
      message.includes("increíble")
    ) {
      return botResponses.politeResponse
    }

    if (message.includes("contacto") || message.includes("contact")) {
      return botResponses.contact
    }

    if (message.includes("hola") || message.includes("hi") || message.includes("hello")) {
      return botResponses.greeting
    }

    if (message.includes("características") || message.includes("features") || message.includes("funciones")) {
      return botResponses.features
    }

    if (message.includes("ventas") || message.includes("sales")) {
      return botResponses.sales
    }

    if (message.includes("productos") || message.includes("inventario") || message.includes("products")) {
      return botResponses.products
    }

    if (message.includes("clientes") || message.includes("customers") || message.includes("usuarios")) {
      return botResponses.clients
    }

    if (message.includes("analytics") || message.includes("dashboard") || message.includes("reportes")) {
      return botResponses.analytics
    }

    if (message.includes("ayuda") || message.includes("help") || message.includes("comandos")) {
      return botResponses.help
    }

    return `Entiendo que preguntas sobre "${userMessage}". ${botResponses.help}`
  }

  const handleAutoContactSave = async (email: string, message: string) => {
    try {
      const supabase = createClient()
      const contactData: ContactMessage = {
        email: email,
        message: message,
        timestamp: new Date().toISOString(),
      }

      await supabase.from("contact_messages").insert([contactData])
    } catch (error) {
      console.error("Error saving contact:", error)
    }
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isBot: false,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])

    // Simular delay del bot
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: getBotResponse(inputMessage),
        isBot: true,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
    }, 1000)

    setInputMessage("")
  }

  const quickActions = [
    { label: "Características", icon: Settings, action: () => setInputMessage("características") },
    { label: "Ventas", icon: CreditCard, action: () => setInputMessage("ventas") },
    { label: "Productos", icon: Package, action: () => setInputMessage("productos") },
    { label: "Analytics", icon: BarChart3, action: () => setInputMessage("analytics") },
    { label: "Contacto", icon: Mail, action: () => setInputMessage("contacto") },
    { label: "Ayuda", icon: HelpCircle, action: () => setInputMessage("ayuda") },
  ]

  return (
    <div className="bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <MessageCircle className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-lg font-medium text-foreground">Mensajes</h1>
            <Badge
              variant="outline"
              className="border-green-500/20 text-green-400 bg-green-500/10 px-2 py-0.5 ml-auto text-xs"
            >
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
              Bot Activo
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Asistente virtual y contacto automático</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-lg font-medium text-foreground flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-1">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start h-10 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 rounded-lg text-sm"
                    onClick={action.action}
                  >
                    <action.icon className="w-4 h-4 mr-2 text-primary" />
                    {action.label}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-3">
               <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-500/10 rounded-lg">
                      <Target className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Respuesta</p>
                      <p className="text-lg font-semibold text-foreground">Inmediata</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-500/10 rounded-lg">
                      <Mail className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Contacto</p>
                      <p className="text-lg font-semibold text-foreground">Automático</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-3">
            <Card className="border-border/50 shadow-sm h-[calc(100vh-200px)] max-h-[700px] min-h-[500px] flex flex-col">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-lg font-medium text-foreground flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  Asistente Virtual
                  <Badge
                    variant="outline"
                    className="ml-auto border-primary/20 text-primary bg-primary/10 px-2 py-0.5 text-xs"
                  >
                    En línea
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`flex items-start space-x-2 max-w-[80%] ${message.isBot ? "" : "flex-row-reverse space-x-reverse"}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          message.isBot ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {message.isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                      <div
                        className={`rounded-lg p-3 ${
                          message.isBot
                            ? "bg-muted/50 text-muted-foreground border border-border/50"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </CardContent>

              <div className="border-t border-border/50 p-4">
                <div className="flex space-x-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Escribe tu mensaje o email para contacto automático..."
                    className="flex-1 h-10 border-border/50 focus:border-primary text-sm"
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Tip: Escribe tu email en cualquier mensaje y te contactaremos automáticamente
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
