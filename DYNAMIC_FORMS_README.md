# Sistema de Formularios Dinámicos con Supabase

Este sistema permite crear, gestionar y compartir formularios dinámicos utilizando Supabase como backend.

## Configuración de Supabase

### 1. Ejecutar las migraciones

Ejecuta el archivo `supabase-migrations.sql` en tu proyecto de Supabase para crear las tablas necesarias:

- `form_configs`: Almacena las configuraciones de formularios
- `form_responses`: Almacena las respuestas enviadas

### 2. Configurar variables de entorno

Asegúrate de tener configuradas las siguientes variables en tu archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

## Características del Sistema

### Tipos de Campos Soportados

1. **Texto** - Input de texto simple
2. **Número** - Input numérico con validación
3. **Email** - Input de email con validación
4. **Textarea** - Área de texto multilínea
5. **Select** - Lista desplegable con opciones
6. **Checkbox** - Casilla de verificación
7. **Archivo/Imagen** - Subida de archivos

### Funcionalidades Principales

#### Constructor de Formularios
- Crear formularios desde cero
- Agregar, editar y eliminar campos
- Reordenar campos mediante drag & drop
- Configurar validaciones (requerido, longitud mínima/máxima)
- Vista previa en tiempo real
- Exportar/importar configuraciones JSON

#### Gestión de Formularios
- Guardar formularios en Supabase
- Listar todos los formularios del usuario
- Duplicar formularios existentes
- Eliminar formularios
- Generar enlaces para compartir

#### Formularios Públicos
- Compartir formularios mediante URL única
- Formularios accesibles sin autenticación
- Página de confirmación después del envío
- Validación de tokens de seguridad

#### Respuestas y Analíticas
- Almacenar respuestas en Supabase
- Exportar respuestas como CSV
- Estadísticas básicas de formularios
- Gestión de respuestas por formulario

## Estructura de Archivos

```
├── types/form-builder.ts              # Interfaces TypeScript
├── lib/supabase/form-service.ts       # Servicio para operaciones con Supabase
├── components/FormBuilder.tsx         # Constructor visual de formularios
├── components/DynamicForm.tsx         # Renderizador de formularios
├── app/dynamic-form-concept/page.tsx  # Página principal del sistema
├── app/form/[token]/page.tsx          # Página pública para llenar formularios
└── supabase-migrations.sql           # Script de migración para Supabase
```

## Uso del Sistema

### 1. Crear un Formulario

1. Ve a `/dynamic-form-concept`
2. Haz clic en "Nuevo Formulario"
3. Configura título y descripción
4. Agrega campos usando el botón "+"
5. Configura cada campo (tipo, etiqueta, validaciones)
6. Guarda el formulario

### 2. Compartir un Formulario

1. Selecciona un formulario guardado
2. Haz clic en "Editar" para abrirlo en el constructor
3. Haz clic en "Compartir" para generar un enlace
4. Copia y comparte la URL generada

### 3. Llenar un Formulario

1. Accede a la URL compartida: `/form/[token]`
2. Completa todos los campos requeridos
3. Haz clic en "Enviar"
4. Verás una confirmación de envío exitoso

## Seguridad y Permisos

### Row Level Security (RLS)

Las tablas tienen políticas RLS configuradas:

- **form_configs**: Los usuarios solo pueden ver/editar sus propios formularios
- **form_responses**: Acceso público para insertar, privado para leer

### Tokens de Compartir

- Se generan automáticamente al compartir un formulario
- Son únicos y seguros (UUID v4)
- Se pueden deshabilitar para revocar acceso
- Tienen fecha de expiración opcional

## Personalización

### Agregar Nuevos Tipos de Campo

1. Actualiza las interfaces en `types/form-builder.ts`
2. Agrega el renderizado en `components/DynamicForm.tsx`
3. Agrega la configuración en `components/FormBuilder.tsx`
4. Actualiza las validaciones según sea necesario

### Estilos y Temas

El sistema utiliza Tailwind CSS y shadcn/ui components. Puedes personalizar:

- Colores y temas en `tailwind.config.js`
- Componentes UI en `components/ui/`
- Estilos específicos en cada componente

## Próximas Mejoras

- [ ] Analíticas avanzadas con gráficos
- [ ] Campos condicionales (mostrar/ocultar según respuestas)
- [ ] Integración con webhooks
- [ ] Plantillas de formularios predefinidas
- [ ] Colaboración en tiempo real
- [ ] Exportación a PDF
- [ ] Integración con servicios de email
- [ ] Campos de firma digital
- [ ] Validaciones personalizadas con JavaScript
- [ ] Temas y personalización visual avanzada

## Soporte

Para reportar problemas o solicitar nuevas características, crea un issue en el repositorio del proyecto.