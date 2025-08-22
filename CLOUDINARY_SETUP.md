# Configuración de Cloudinary para Subida de Logos

## Pasos para configurar Cloudinary:

### 1. Crear cuenta en Cloudinary
- Ve a [https://cloudinary.com](https://cloudinary.com)
- Regístrate o inicia sesión
- Ve al Dashboard

### 2. Obtener las credenciales
En tu Dashboard de Cloudinary encontrarás:
- **Cloud Name**: Tu nombre de nube único
- **API Key**: Tu clave API
- **API Secret**: Tu secreto API (manténlo privado)

### 3. Crear un Upload Preset
1. Ve a **Settings** → **Upload**
2. Scroll hacia abajo hasta **Upload presets**
3. Haz clic en **Add upload preset**
4. Configura:
   - **Preset name**: `empresa-logos` (o el nombre que prefieras)
   - **Signing Mode**: `Unsigned` (para uso público)
   - **Folder**: `empresa-logos` (opcional, para organizar)
   - **Allowed formats**: `jpg,png,gif,webp,jpeg`
   - **Max file size**: `5000000` (5MB)
   - **Image transformations**: Opcional, puedes agregar redimensionamiento automático
5. Guarda el preset

### 4. Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=empresa-logos
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Supabase (si no las tienes ya)
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### 5. Reiniciar el servidor
Después de configurar las variables de entorno:
```bash
npm run dev
```

## Características implementadas:

✅ **Subida de imágenes**: Arrastra y suelta o selecciona archivos
✅ **Vista previa**: Muestra el logo subido inmediatamente
✅ **Validación**: Solo acepta imágenes (PNG, JPG, GIF, WebP)
✅ **Límite de tamaño**: Máximo 5MB por imagen
✅ **Organización**: Los logos se guardan en la carpeta `empresa-logos`
✅ **Eliminación**: Botón para quitar el logo seleccionado
✅ **Optimización**: Cloudinary optimiza automáticamente las imágenes

## Beneficios de Cloudinary:

- **Gratis hasta 25GB** de almacenamiento y 25GB de ancho de banda
- **Optimización automática** de imágenes
- **CDN global** para carga rápida
- **Transformaciones en tiempo real** (redimensionar, recortar, etc.)
- **Respaldo automático** y alta disponibilidad

## Troubleshooting:

**Error: "Upload preset not found"**
- Verifica que el upload preset esté creado en Cloudinary
- Asegúrate de que el nombre en `.env.local` coincida exactamente

**Error: "Invalid cloud name"**
- Verifica que `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` sea correcto
- No incluyas espacios o caracteres especiales

**Las imágenes no se muestran**
- Verifica que `res.cloudinary.com` esté en la configuración de dominios de Next.js
- Revisa la consola del navegador para errores de CORS

## Plan gratuito de Cloudinary:
- 25 GB de almacenamiento
- 25 GB de ancho de banda mensual
- 1000 transformaciones por mes
- Suficiente para proyectos pequeños y medianos