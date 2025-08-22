-- Migración para Sistema de Formularios Dinámicos
-- Ejecutar en Supabase SQL Editor

-- 1. Tabla para configuraciones de formularios
CREATE TABLE form_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  fields JSONB NOT NULL, -- Array de campos del formulario
  submit_button_text VARCHAR(100) DEFAULT 'Enviar',
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false, -- Para formularios compartibles
  share_token VARCHAR(50) UNIQUE, -- Token único para compartir
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla para respuestas de formularios
CREATE TABLE form_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_config_id UUID REFERENCES form_configs(id) ON DELETE CASCADE,
  responses JSONB NOT NULL, -- Respuestas del usuario
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Opcional si es anónimo
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET, -- Para tracking opcional
  user_agent TEXT -- Para analytics opcional
);

-- 3. Índices para optimizar consultas
CREATE INDEX idx_form_configs_created_by ON form_configs(created_by);
CREATE INDEX idx_form_configs_share_token ON form_configs(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX idx_form_configs_is_public ON form_configs(is_public) WHERE is_public = true;
CREATE INDEX idx_form_responses_form_config_id ON form_responses(form_config_id);
CREATE INDEX idx_form_responses_submitted_at ON form_responses(submitted_at);

-- 4. Función para generar token de compartir
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS VARCHAR(50) AS $$
BEGIN
  RETURN encode(gen_random_bytes(25), 'base64');
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_form_configs_updated_at
  BEFORE UPDATE ON form_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Políticas RLS (Row Level Security)
ALTER TABLE form_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;

-- Política para form_configs: Los usuarios pueden ver/editar sus propios formularios
CREATE POLICY "Users can manage their own forms" ON form_configs
  FOR ALL USING (auth.uid() = created_by);

-- Política para formularios públicos: Cualquiera puede verlos
CREATE POLICY "Anyone can view public forms" ON form_configs
  FOR SELECT USING (is_public = true AND is_active = true);

-- Política para form_responses: Los creadores pueden ver las respuestas de sus formularios
CREATE POLICY "Form creators can view responses" ON form_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM form_configs 
      WHERE form_configs.id = form_responses.form_config_id 
      AND form_configs.created_by = auth.uid()
    )
  );

-- Política para insertar respuestas: Cualquiera puede responder formularios activos
CREATE POLICY "Anyone can submit responses to active forms" ON form_responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM form_configs 
      WHERE form_configs.id = form_responses.form_config_id 
      AND form_configs.is_active = true
    )
  );

-- 7. Función para generar y asignar token de compartir
CREATE OR REPLACE FUNCTION set_share_token_for_form(form_id UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
  new_token VARCHAR(50);
  rows_affected INTEGER;
BEGIN
  new_token := generate_share_token();
  
  UPDATE form_configs 
  SET share_token = new_token, is_public = true 
  WHERE id = form_id AND created_by = auth.uid();
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  IF rows_affected = 0 THEN
    RAISE EXCEPTION 'Form not found or access denied';
  END IF;
  
  RETURN new_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Vista para estadísticas de formularios
CREATE VIEW form_stats AS
SELECT 
  fc.id,
  fc.title,
  fc.created_at,
  COUNT(fr.id) as total_responses,
  COUNT(DISTINCT DATE(fr.submitted_at)) as days_with_responses,
  MAX(fr.submitted_at) as last_response_at
FROM form_configs fc
LEFT JOIN form_responses fr ON fc.id = fr.form_config_id
GROUP BY fc.id, fc.title, fc.created_at;

-- 9. Datos de ejemplo (opcional)
INSERT INTO form_configs (title, description, fields, created_by) VALUES 
(
  'Formulario de Contacto',
  'Formulario básico de contacto para el sitio web',
  '[
    {
      "id": "nombre",
      "type": "text",
      "label": "Nombre completo",
      "placeholder": "Ingresa tu nombre",
      "required": true,
      "order": 0
    },
    {
      "id": "email",
      "type": "email",
      "label": "Correo electrónico",
      "placeholder": "tu@email.com",
      "required": true,
      "order": 1
    },
    {
      "id": "mensaje",
      "type": "textarea",
      "label": "Mensaje",
      "placeholder": "Escribe tu mensaje aquí",
      "required": true,
      "order": 2,
      "rows": 4
    }
  ]'::jsonb,
  (SELECT id FROM auth.users LIMIT 1)
);

-- Comentarios sobre el esquema:
-- 
-- form_configs.fields: Almacena la configuración completa de campos como JSONB
-- form_responses.responses: Almacena las respuestas del usuario como JSONB
-- share_token: Permite compartir formularios sin autenticación
-- RLS: Asegura que solo los creadores vean sus formularios y respuestas
-- Índices: Optimizan las consultas más comunes
-- 
-- Ejemplo de estructura de fields JSONB:
-- [
--   {
--     "id": "campo_unico",
--     "type": "text|email|number|select|checkbox|textarea|file|image",
--     "label": "Etiqueta del campo",
--     "placeholder": "Texto de ayuda",
--     "required": true|false,
--     "order": 0,
--     "options": [{ "value": "val", "label": "Label" }], // Solo para select
--     "min": 0, "max": 100, // Solo para number
--     "minLength": 5, "maxLength": 50 // Solo para text
--   }
-- ]
--
-- Ejemplo de estructura de responses JSONB:
-- {
--   "campo_unico": "valor_respuesta",
--   "otro_campo": "otra_respuesta"
-- }