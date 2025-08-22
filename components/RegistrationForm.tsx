'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { CAREERS, CAMPUSES } from '@/app/data/constants';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// Crear cliente de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
//AQUI ERA EL ERRO DE LAS VALIDACIO----------------------------------------------------------------------------------------------------
const formSchema = z.object({
  userType: z.enum(['student', 'alumni'], {
    required_error: 'Selecciona el tipo de usuario',
  }),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  matricula: z.string().min(10, 'La matrícula debe tener al menos 10 caracteres'),
  semester: z.number()
    .min(1, 'El semestre debe estar entre 1 y 8')
    .max(8, 'El semestre debe estar entre 1 y 8'),
  career: z.string().min(1, 'Selecciona una carrera'),
  campus: z.string().min(1, 'Selecciona un campus'),
  whatsapp: z.string().optional(), // WhatsApp es opcional por defecto
  email: z.string().optional(), // Email es opcional por defecto
})
  .superRefine((data, ctx) => {
    // Validación condicional para alumni
    if (data.userType === 'alumni') {
      // Validación de WhatsApp
      if (!data.whatsapp || data.whatsapp.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'WhatsApp es obligatorio para exalumnos',
          path: ['whatsapp'],
        });
      }

      // Validación de correo electrónico
      if (!data.email || data.email.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Correo electrónico es obligatorio para exalumnos',
          path: ['email'],
        });
      } else if (!/\S+@\S+\.\S+/.test(data.email)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Ingresa un correo electrónico válido',
          path: ['email'],
        });
      }
    }
  });

//-------------------------------------------------------------------------------


export default function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      matricula: '',
      userType: undefined,
      semester: 1,
      career: '',
      campus: '',
      whatsapp: '',
      email: '',
    },
  });

  // Función para manejar el envío del formulario
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      // Inserta los datos en Supabase
      const { error } = await supabase
        .from('RegistroTecmi')
        .insert([
          {
            name: values.name,
            matricula: values.matricula,
            semester: values.semester,
            career: values.career,
            campus: values.campus,
            userType: values.userType, // Se agrega userType
            whatsapp: values.whatsapp || null, // Si está vacío, se guarda como NULL
            email: values.email || null, // Si está vacío, se guarda como NULL
          },
        ]);

      if (error) {
        throw error;
      }

      localStorage.setItem('userCareer', values.career);
      router.push('/ofertaTrabajo'); // Redirige al usuario a la página de ofertas de empleo

      toast.success('¡Registro exitoso! Estás participando en la rifa');
      form.reset();
    } catch (error) {
      toast.error('Error al registrar. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const userType = form.watch('userType');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="userType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Estudiante</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="¿Qué tipo de estudiante eres?" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="student">Estudiante</SelectItem>
                  <SelectItem value="alumni">ExaTecmi</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        { userType !== undefined && (
            <>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Diego Rodriguez Franco" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {userType === 'alumni' && (
                <>
                  <FormField
                    control={form.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp</FormLabel>
                        <FormControl>
                          <Input placeholder="+52 1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico Personal</FormLabel>
                        <FormControl>
                          <Input placeholder="correo@ejemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="matricula"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matrícula</FormLabel>
                    <FormControl>
                      <Input placeholder="AL02135046" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {userType === 'student' && (
                <FormField
                  control={form.control}
                  name="semester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Semestre que se cursa actualmente.</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="8"
                          placeholder="1"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="career"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carrera</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu carrera" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CAREERS.map((career) => (
                          <SelectItem key={career.id} value={career.id}>
                            {career.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="campus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campus</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu campus al que perteneces" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CAMPUSES.map((campus) => (
                          <SelectItem key={campus.id} value={campus.id}>
                            {campus.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-admin-blue text-white hover:bg-admin-blue focus:bg-admin-blue active:bg-admin-blue"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registrando...' : 'Registrar'}
              </Button>
            </>
          )
        }

      </form>
    </Form>


  );
}
