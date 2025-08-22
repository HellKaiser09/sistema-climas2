'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { CAREERS } from '@/app/data/constants';
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
import { createClient } from '@/lib/supabase/client';
import CloudinaryUpload from '@/components/CloudinaryUpload';

const formSchema = z.object({
  nombreEmpresa: z.string().min(2, 'El nombre de la empresa debe tener al menos 2 caracteres'),
  ubicacion: z.string().min(2, 'La ubicación es obligatoria'),
  nombreColaborador: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  cargo: z.string(),
  correo: z.string().email(),
  telefono: z.string(),
  llevaAcompanante: z.boolean().optional(),
  nombreAcompañante: z.string().optional(),
  correo2: z.string().optional(),
  telefono2: z.string().optional(),
  personasExtras: z.string().optional(),
  nivelVacante: z.array(z.object({
    tipo: z.string(),
    descripcion: z.string(),
  })).min(1, 'Selecciona al menos un nivel de vacante'),
  carreraBuscada: z.array(z.string()).min(1, 'Selecciona al menos una carrera'),
  requiereStand: z.boolean().optional(),
  participaBolsa: z.boolean().optional(),
  traeArticulos: z.boolean().optional(),
  articulo: z.string().optional(),
  logo: z.string().min(1, 'El logo es obligatorio'),
  descripcion: z.string().optional(),
  autorizacion: z.enum(['SI', 'NO'], {
    errorMap: () => ({ message: 'Debes autorizar el uso de tus datos' }),
  }),
  llevaPersonasExtras: z.boolean().optional(),
  cantidadPersonasExtras: z.number().optional(),
  nombresPersonasExtras: z.array(z.string()).optional(),
  luz: z.boolean().optional().default(false),
});

type FormData = z.infer<typeof formSchema>;

export default function EmpresaRegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const supabase = createClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreEmpresa: '',
      ubicacion: '',
      nombreColaborador: '',
      cargo: '',
      correo: '',
      telefono: '',
      llevaAcompanante: false,
      nombreAcompañante: '',
      correo2: '',
      telefono2: '',
      personasExtras: '',
      nivelVacante: [],
      carreraBuscada: [],
      requiereStand: false,
      participaBolsa: false,
      traeArticulos: false,
      articulo: '',
      logo: '',
      descripcion: '',
      autorizacion: "NO",
      llevaPersonasExtras: false,
      cantidadPersonasExtras: 0,
      nombresPersonasExtras: [],
    },
  });

  const watchAcompanante = form.watch('llevaAcompanante');
  const watchArticulos = form.watch('traeArticulos');

  useEffect(() => {
    const savedData = localStorage.getItem('empresa-registro-data');
    const savedId = localStorage.getItem('empresa-registro-id');

    if (savedData && savedId) {
      try {
        const parsedData = JSON.parse(savedData);
        // Si nivelVacante es un string (datos antiguos), convertirlo al nuevo formato
        if (typeof parsedData.nivelVacante === 'string') {
          parsedData.nivelVacante = [];
        } else if (parsedData.nivelVacante && !Array.isArray(parsedData.nivelVacante)) {
          // Si es un objeto (formato anterior), convertir a array
          parsedData.nivelVacante = [parsedData.nivelVacante];
        }
        form.reset(parsedData);
        setEmpresaId(savedId);
        setIsEditing(true);
        toast.info('Se cargaron los datos guardados. Puedes continuar editando.');
      } catch (error) {
        console.error('Error al cargar datos guardados:', error);
        localStorage.removeItem('empresa-registro-data');
        localStorage.removeItem('empresa-registro-id');
      }
    }
  }, [form]);

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    console.log('📝 Form submission values:', values);
    console.log('🖼️ Logo value in form:', values.logo);

    try {
      const carrerasTexto = values.carreraBuscada.join(',');
      const dataToSave = {
        ...values,
        carreraBuscada: carrerasTexto,
        nivelVacante: JSON.stringify(values.nivelVacante), // Convertir a JSON string
        tipoUsuario: 'empresa',
        // Asegurar que los campos numéricos sean null si están vacíos
        cantidadPersonasExtras: values.cantidadPersonasExtras || null,
        // Limpiar campos de texto vacíos
        personasExtras: values.personasExtras || null,
        nombreAcompañante: values.nombreAcompañante || null,
        correo2: values.correo2 || null,
        telefono2: values.telefono2 || null,
        articulo: values.articulo || null,
        logo: values.logo || null,
        descripcion: values.descripcion || null,
      };

      console.log('💾 Data to save:', dataToSave);
      console.log('🖼️ Logo in dataToSave:', dataToSave.logo);

      if (isEditing && empresaId) {
        const { error } = await supabase
          .from('RegistroEmpresas')
          .update(dataToSave)
          .eq('id', empresaId);

        if (error) throw error;

        localStorage.setItem('empresa-registro-data', JSON.stringify(values));
        toast.success('¡Registro actualizado exitosamente!');
      } else {
        const { data, error } = await supabase
          .from('RegistroEmpresas')
          .insert([dataToSave])
          .select('id')
          .single();

        if (error) throw error;

        if (data?.id) {
          localStorage.setItem('empresa-registro-data', JSON.stringify(values));
          localStorage.setItem('empresa-registro-id', data.id);
          setEmpresaId(data.id);
          setIsEditing(true);
        }

        toast.success('¡Registro exitoso! Puedes volver a editar este formulario más tarde.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al registrar');
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleRemoveCareer = (careerId: string, field: any) => {
    const nuevasCarreras = field.value.filter((id: string) => id !== careerId);
    field.onChange(nuevasCarreras);
  };

  const clearLocalData = () => {
    localStorage.removeItem('empresa-registro-data');
    localStorage.removeItem('empresa-registro-id');
    setIsEditing(false);
    setEmpresaId(null);
    form.reset();
    toast.success('Formulario reiniciado');
  };

  return (
    <div className="space-y-4">
      {isEditing && (
        <div className="text-center space-y-2 p-4 bg-green-50 border border-green-200 rounded-lg">

          <p className="text-sm text-green-600">
            <span className='block font-bold'>Formulario Guardado exitosamente. Puedes continuar editando.</span>
            <br />
            Puedes volver a este enlace en cualquier momento para editar o actualizar tu información. Próximamente, Iván Ilich, Coordinador de Tecmilenio, se pondrá en contacto contigo.
          </p>

          <Button
            variant="outline"
            size="sm"
            onClick={clearLocalData}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            Crear Nuevo Registro
          </Button>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Campos principales */}
          <FormField
            control={form.control}
            name="nombreEmpresa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la empresa</FormLabel>
                <FormControl>
                  <Input placeholder="Mi Empresa S.A. de C.V" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="descripcion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción de la empresa</FormLabel>
                <FormControl>
                  <Input placeholder="Breve descripción" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ubicacion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ubicación</FormLabel>
                <FormControl>
                  <Input placeholder="Ciudad, Estado, Municipio, Calle y C.P" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nombreColaborador"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del colaborador</FormLabel>
                <FormControl>
                  <Input placeholder="Hernesto Guerrero" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cargo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cargo</FormLabel>
                <FormControl>
                  <Input placeholder="Ejemplo: Reclutador" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="correo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input placeholder="correo@empresa.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Whatsapp</FormLabel>
                <FormControl>
                  <Input placeholder="555-555-5555" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ¿Llevarás acompañante? */}
          <FormField
            control={form.control}
            name="llevaAcompanante"
            render={({ field }) => (
              <FormItem>
                <FormLabel>¿Llevarás acompañante?</FormLabel>
                <FormControl>
                  <select
                    className="border rounded px-3 py-2 w-full"
                    value={field.value ? "SI" : field.value === false ? "NO" : ""}
                    onChange={e => field.onChange(e.target.value === "SI")}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="SI">Sí</option>
                    <option value="NO">No</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campos de acompañante solo si llevaAcompanante es true */}
          {watchAcompanante && (
            <>
              <FormField
                control={form.control}
                name="nombreAcompañante"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del acompañante</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del acompañante" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="correo2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo del acompañante</FormLabel>
                    <FormControl>
                      <Input placeholder="correo@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefono2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono del acompañante</FormLabel>
                    <FormControl>
                      <Input placeholder="555-555-5555" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {/* ¿Llevarás personas extras? */}
          <FormField
            control={form.control}
            name="llevaPersonasExtras"
            render={({ field }) => (
              <FormItem>
                <FormLabel>¿Llevarás personas extras?</FormLabel>
                <FormControl>
                  <select
                    className="border rounded px-3 py-2 w-full"
                    value={field.value ? "SI" : field.value === false ? "NO" : ""}
                    onChange={e => field.onChange(e.target.value === "SI")}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="SI">Sí</option>
                    <option value="NO">No</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Si lleva personas extras, pide la cantidad */}
          {form.watch('llevaPersonasExtras') && (
            <FormField
              control={form.control}
              name="cantidadPersonasExtras"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>¿Cuántas personas adicionales asistirán?</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="0"
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Genera los campos para los nombres de las personas extras */}
          {form.watch('llevaPersonasExtras') && (form.watch('cantidadPersonasExtras') ?? 0) > 0 &&
            Array.from({ length: form.watch('cantidadPersonasExtras') ?? 0 }).map((_, idx) => (
              <FormField
                key={idx}
                control={form.control}
                name={`nombresPersonasExtras.${idx}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{`Nombre de la persona extra #${idx + 1}`}</FormLabel>
                    <FormControl>
                      <Input placeholder={`Nombre de la persona #${idx + 1}`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))
          }

          {/* Nivel vacante */}
          <FormField
            control={form.control}
            name="nivelVacante"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nivel de vacante (puedes seleccionar múltiples opciones)</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      const opcionesVacante = {
                        'medio-tiempo': {
                          tipo: 'medio-tiempo',
                          descripcion: 'Medio tiempo - Para estudiantes activos'
                        },
                        'tiempo-completo': {
                          tipo: 'tiempo-completo',
                          descripcion: 'Tiempo completo - Para egresados'
                        },
                        'practicas': {
                          tipo: 'practicas',
                          descripcion: 'Prácticas profesionales - Para estudiantes'
                        },
                        'proyecto': {
                          tipo: 'proyecto',
                          descripcion: 'Por proyecto - Trabajo temporal'
                        },
                        'freelance': {
                          tipo: 'freelance',
                          descripcion: 'Freelance - Trabajo independiente'
                        }
                      };

                      const selectedOption = opcionesVacante[value as keyof typeof opcionesVacante];
                      if (selectedOption && !field.value.some((item: any) => item.tipo === selectedOption.tipo)) {
                        field.onChange([...field.value, selectedOption]);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona los tipos de vacante" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medio-tiempo">Medio tiempo - Para estudiantes activos</SelectItem>
                      <SelectItem value="tiempo-completo">Tiempo completo - Para egresados</SelectItem>
                      <SelectItem value="practicas">Prácticas profesionales - Para estudiantes</SelectItem>
                      <SelectItem value="servicio-social">Servicio social - Para estudiantes</SelectItem>
                      <SelectItem value="proyecto">Por proyecto - Trabajo temporal</SelectItem>
                      <SelectItem value="freelance">Freelance - Trabajo independiente</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>

                {/* Mostrar opciones seleccionadas */}
                <div className="mt-2 space-y-2">
                  {field.value.map((vacante: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-blue-50 p-2 rounded-md border border-blue-200"
                    >
                      <div>
                        <span className="font-medium text-blue-900">{vacante.descripcion}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newValue = field.value.filter((_: any, i: number) => i !== index);
                          field.onChange(newValue);
                        }}
                        className="text-red-600 hover:text-red-800 hover:bg-red-100"
                      >
                        Eliminar
                      </Button>
                    </div>
                  ))}
                </div>

                {field.value.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selecciona al menos un tipo de vacante
                  </p>
                )}

                <FormMessage />
              </FormItem>
            )}
          />

          {/* Carreras buscadas */}
          <FormField
            control={form.control}
            name="carreraBuscada"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Carreras buscadas</FormLabel>
                <Select
                  onValueChange={(value) => {
                    if (!field.value.includes(value)) {
                      field.onChange([...field.value, value]);
                    }
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona carreras" />
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
                <div className="mt-2 space-y-2">
                  {field.value.map((id) => {
                    const career = CAREERS.find((c) => c.id === id);
                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between bg-gray-100 p-2 rounded-md"
                      >
                        <span>{career?.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleRemoveCareer(id, field)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />


          {/* ¿Requiere stand? */}
          <FormField
            control={form.control}
            name="requiereStand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>¿Requiere stand?</FormLabel>
                <span>
                  <p className="text-sm text-neutral-500">
                    Si no cuentas con stand, nosotros te proporcionaremos
                  </p>
                  <p className="text-sm text-neutral-500">
                    1 mesa sin mantel de 1.5 m de largo
                    Sillas para los asistentes 📌 Importante: debes traer tu propio mantel y materiales decorativos. El espacio asignado será de aproximadamente 1.5 metros.
                  </p>
                </span>
                <FormControl>
                  <select
                    className="border rounded px-3 py-2 w-full"
                    value={field.value ? "SI" : field.value === false ? "NO" : ""}
                    onChange={e => field.onChange(e.target.value === "SI")}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="SI">✅ Sí, traeremos nuestro stand</option>
                    <option value="NO">❌ No, requerimos el mobiliario que proporcionan</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="luz"
            render={({ field }) => (
              <FormItem className='flex items-center gap-4'>
                <FormLabel className='block w-full'>¿Va a requerir conexión eléctrica?</FormLabel>
                <FormControl>
                  <Input
                    type="checkbox"
                    checked={field.value ?? false}
                    onChange={e => field.onChange(e.target.checked)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ¿Participa la empresa en la bolsa de empleo? */}
          <FormField
            control={form.control}
            name="participaBolsa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>¿Está inscrito en la bolsa de empleo del Tecmilenio?"</FormLabel>
                <FormControl>
                  <select
                    className="border rounded px-3 py-2 w-full"
                    value={field.value ? "SI" : field.value === false ? "NO" : ""}
                    onChange={e => field.onChange(e.target.value === "SI")}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="SI">Sí</option>
                    <option value="NO">No</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Donación de artículo promocional */}
          <FormField
            control={form.control}
            name="traeArticulos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Donación de artículo promocional</FormLabel>
                <div className="mb-4">
                  <p className='text-gray-600 mb-4 text-sm'>
                    Requisito de participación:
                    Para enriquecer la experiencia del evento, solicitamos la donación de un artículo promocional "premium" como premio para una rifa destinada a los estudiantes participantes. (Ej. Bocina inteligentes / Auriculares Inalámbricos / Tarjetas de regalos / Smartwatch / Cámara deportiva / Kit de herramientas multiusos / etc)
                  </p>
                </div>
                <FormControl>
                  <select
                    className="border rounded px-3 py-2 w-full"
                    value={field.value ? "SI" : ""}
                    onChange={e => field.onChange(e.target.value === "SI")}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="SI">✅ Sí, confirmo de enterado y nos comprometemos a llevar la donación</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo para especificar el artículo si confirma la donación */}
          {watchArticulos && (
            <FormField
              control={form.control}
              name="articulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>¿Qué artículo donarán?</FormLabel>
                  <FormControl>
                    <Input placeholder="Describe el artículo que donarán (ej. Smartwatch, Auriculares Bluetooth, etc.)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Logo */}
          <FormField
            control={form.control}
            name="logo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo de la empresa</FormLabel>
                <FormControl>
                  <CloudinaryUpload
                    value={field.value}
                    onChange={field.onChange}
                    onRemove={() => field.onChange('')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="autorizacion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>¿Autoriza el uso de sus datos?</FormLabel>
                <FormControl>
                  <select
                    className="border rounded px-3 py-2 w-full"
                    value={field.value}
                    onChange={e => field.onChange(e.target.value)}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="SI">Sí</option>
                    <option value="NO">No</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <p>Despues de enviar este formulario puedes volverlo a editar.</p>
          </div>
          <Button
            type="submit"
            className="w-full bg-black text-white hover:bg-black/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? (isEditing ? 'Actualizando...' : 'Registrando...') : (isEditing ? 'Actualizar empresa' : 'Registrar empresa')}
          </Button>
        </form>
      </Form>
    </div>
  );
}
