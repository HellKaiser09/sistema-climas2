"use client"

import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { createClient, supabaseClient } from '@/lib/supabase/client';
import { toast } from "sonner"
import MainLayout from "@/Layouts/MainLayout"

type FormValues = {
  name: string
  email: string
  message: string
}

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>()

  const onSubmit = async (data: FormValues) => {
    try {
      const { error } = await supabaseClient
        .from('contact_messages')
        .insert([
          {
            name: data.name,
            email: data.email,
            message: data.message
          }
        ])
        
      if (error) throw error
      toast("Mensaje enviado con éxito")
      console.log("Message sent successfully")
    } catch (e) {
      toast.error("Hubo un error al enviar el mensaje")
      console.error(e)
    }
  }

  return (
    <MainLayout>
      <div className="gap-6 max-w-2xl mx-auto px-4 mt-20 space-y-4">
        <h1 className="font-bold text-4xl">Contáctanos</h1>
        <p>Llena el formulario y te contactaremos pronto.</p>
        <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              type="text"
              placeholder="Tu nombre"
              {...register("name", { required: "Nombre es obligatorio" })}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="Tu correo"
              {...register("email", {
                required: "Correo electrónico es obligatorio",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Correo inválido"
                }
              })}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="message">Mensaje</Label>
            <Textarea
              id="message"
              rows={4}
              placeholder="Tu mensaje"
              {...register("message", { required: "Mensaje es obligatorio" })}
              disabled={isSubmitting}
            />
            {errors.message && (
              <p className="text-sm text-red-500">{errors.message.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
            data-umami-event="contact-form-submit"
          >
            {isSubmitting ? "Enviando..." : "Enviar mensaje"}
          </Button>
        </form>
      </div>
    </MainLayout>
  )
}
