# Configuración del Upload Preset de Cloudinary

## ⚠️ IMPORTANTE: Configuración Requerida

Para que la subida de imágenes funcione correctamente, **DEBES** crear un upload preset unsigned en tu dashboard de Cloudinary.

## Pasos para crear el preset:

### 1. Accede a tu Dashboard de Cloudinary
- Ve a [https://cloudinary.com/console](https://cloudinary.com/console)
- Inicia sesión con tu cuenta

### 2. Navega a Upload Presets
- En el menú lateral, ve a **Settings** (Configuración)
- Haz clic en la pestaña **Upload**
- Busca la sección **Upload presets**

### 3. Crear el preset
- Haz clic en **"Add upload preset"**
- Configura los siguientes valores:

#### Configuración básica:
- **Preset name**: `ml_default`
- **Signing Mode**: **Unsigned** ⚠️ (MUY IMPORTANTE)
- **Use filename**: ✅ Activado
- **Unique filename**: ✅ Activado
- **Overwrite**: ❌ Desactivado (por seguridad)

#### Configuración de archivos:
- **Resource type**: `Image`
- **Allowed formats**: `jpg,png,gif,webp,jpeg`
- **Max file size**: `10000000` (10MB)
- **Max image width**: `2000`
- **Max image height**: `2000`

#### Configuración de carpeta:
- **Folder**: `form-uploads`

### 4. Guardar el preset
- Haz clic en **"Save"**

## ✅ Verificación

Una vez creado el preset, deberías ver:
- Nombre: `ml_default`
- Modo: `Unsigned`
- Estado: `Enabled`

## 🔧 Variables de entorno

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ml_default
```

## 🚨 Solución de problemas

### Si el widget no se abre:
1. Verifica que el preset sea **Unsigned**
2. Confirma que el nombre del preset coincida exactamente
3. Asegúrate de que el preset esté **Enabled**

### Si aparece "Upload preset not found":
1. El preset no existe o el nombre es incorrecto
2. El preset puede estar deshabilitado
3. Verifica las variables de entorno

### Si el upload falla:
1. Verifica el tamaño del archivo (máximo 10MB)
2. Confirma que el formato sea compatible
3. Revisa la consola del navegador para más detalles

## 📝 Notas importantes

- El preset `ml_default` es el preset por defecto de Cloudinary
- Si no tienes este preset, puedes crearlo siguiendo los pasos anteriores
- Alternativamente, puedes usar cualquier preset unsigned que tengas configurado
- Solo cambia el valor en `.env.local` por el nombre de tu preset