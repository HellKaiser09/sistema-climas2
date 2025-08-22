# Debug: Problema con Funcionalidad de Compartir

## Síntomas
- El token se genera (status 200)
- La URL se crea correctamente
- Al visitar la URL: "Formulario no encontrado o el enlace ha expirado"

## Pasos para Diagnosticar

### 1. Verificar que las migraciones se aplicaron
Ejecuta en Supabase SQL Editor:

```sql
-- Verificar estructura de tabla
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'form_configs' 
AND column_name IN ('share_token', 'is_public');

-- Verificar función RPC existe
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'set_share_token_for_form';
```

### 2. Probar función RPC manualmente
```sql
-- Obtener un ID de formulario existente
SELECT id, title FROM form_configs LIMIT 1;

-- Probar la función (reemplaza con ID real)
SELECT set_share_token_for_form('tu-form-id-aqui');

-- Verificar que se actualizó
SELECT id, title, share_token, is_public 
FROM form_configs 
WHERE id = 'tu-form-id-aqui';
```

### 3. Verificar políticas de seguridad
```sql
-- Ver políticas activas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'form_configs';
```

### 4. Probar consulta de búsqueda por token
```sql
-- Buscar formulario por token (reemplaza con token real)
SELECT id, title, share_token, is_active, is_public, created_by
FROM form_configs 
WHERE share_token = 'tu-token-aqui';
```

## Posibles Causas

1. **Función RPC no actualizada**: La función antigua no verifica filas afectadas
2. **Permisos RLS**: Las políticas pueden estar bloqueando la actualización
3. **Token no se guarda**: La función genera el token pero no lo persiste
4. **Consulta incorrecta**: Los filtros en getFormByShareToken son muy restrictivos

## Solución Temporal

Si el problema persiste, puedes probar esta consulta más simple:

```typescript
// En form-service.ts, reemplaza temporalmente getFormByShareToken con:
async getFormByShareToken(shareToken: string): Promise<FormConfig | null> {
  const { data, error } = await this.supabase
    .from('form_configs')
    .select('*')
    .eq('share_token', shareToken)
    .single();

  if (error || !data) return null;
  return this.dbToAppConfig(data);
}
```

## Logs a Revisar

Con los logs agregados, revisa en la consola del navegador:

1. **Al generar token**:
   - "Generando token para formulario ID: ..."
   - "Respuesta de RPC: ..."
   - "Verificación después de generar token: ..."

2. **Al cargar formulario público**:
   - "Buscando formulario con token: ..."
   - "Formularios encontrados con este token: ..."
   - "Resultado de consulta filtrada: ..."

Estos logs te dirán exactamente dónde está fallando el proceso.