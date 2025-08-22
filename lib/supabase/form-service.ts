import { createClient } from '@/lib/supabase/client';
import { FormConfig, FormResponse } from '@/types/form-builder';

export interface DatabaseFormConfig {
  id: string;
  title: string;
  description?: string;
  fields: any[];
  submit_button_text?: string;
  is_active: boolean;
  is_public: boolean;
  share_token?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseFormResponse {
  id: string;
  form_config_id: string;
  responses: Record<string, any>;
  submitted_by?: string;
  submitted_at: string;
  ip_address?: string;
  user_agent?: string;
}

export class FormService {
  private supabase = createClient();

  // Convertir de formato de base de datos a formato de aplicación
  private dbToAppConfig(dbConfig: DatabaseFormConfig): FormConfig {
    return {
      id: dbConfig.id,
      title: dbConfig.title,
      description: dbConfig.description,
      fields: dbConfig.fields,
      submitButtonText: dbConfig.submit_button_text,
      createdAt: dbConfig.created_at,
      updatedAt: dbConfig.updated_at,
      shareToken: dbConfig.share_token
    };
  }

  // Convertir de formato de aplicación a formato de base de datos
  private appToDbConfig(appConfig: FormConfig): Partial<DatabaseFormConfig> {
    return {
      title: appConfig.title,
      description: appConfig.description,
      fields: appConfig.fields,
      submit_button_text: appConfig.submitButtonText
    };
  }

  // Obtener todos los formularios del usuario actual
  async getUserForms(): Promise<FormConfig[]> {
    const { data, error } = await this.supabase
      .from('form_configs')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data.map(this.dbToAppConfig);
  }

  // Obtener un formulario por ID
  async getForm(id: string): Promise<FormConfig | null> {
    try {
      const { data, error } = await this.supabase
        .from('form_configs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      if (!data) return null;

      return this.dbToAppConfig(data);
    } catch (error) {
      console.error('Error getting form:', error);
      throw error;
    }
  }

  // Obtener un formulario público por token de compartir
  async getPublicFormByToken(token: string): Promise<FormConfig | null> {
    const { data, error } = await this.supabase
      .from('form_configs')
      .select('*')
      .eq('share_token', token)
      .eq('is_public', true)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return this.dbToAppConfig(data);
  }

  // Obtener un formulario por token de compartir
  // Obtener formulario público por UUID (simplificado para proyecto escolar)
  async getFormByShareToken(formId: string): Promise<FormConfig | null> {
    try {
      console.log('Buscando formulario público con ID:', formId);
      
      const { data, error } = await this.supabase
        .from('form_configs')
        .select('*')
        .eq('id', formId)
        .eq('is_active', true)
        .eq('is_public', true)
        .single();

      console.log('Resultado de consulta:', { data, error });

      if (error) {
        console.log('Error en consulta:', error.code, error.message);
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      if (!data) return null;

      return this.dbToAppConfig(data);
    } catch (error) {
      console.error('Error getting form by ID:', error);
      throw error;
    }
  }

  // Crear un nuevo formulario
  async createForm(config: FormConfig): Promise<FormConfig> {
    const dbConfig = this.appToDbConfig(config);
    
    const { data, error } = await this.supabase
      .from('form_configs')
      .insert(dbConfig)
      .select()
      .single();

    if (error) throw error;
    return this.dbToAppConfig(data);
  }

  // Actualizar un formulario existente
  async updateForm(id: string, config: FormConfig): Promise<FormConfig> {
    const dbConfig = this.appToDbConfig(config);
    
    const { data, error } = await this.supabase
      .from('form_configs')
      .update(dbConfig)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.dbToAppConfig(data);
  }

  // Eliminar un formulario
  async deleteForm(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('form_configs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Hacer formulario público (simplificado - usa UUID directamente)
  async generateShareToken(formId: string): Promise<string> {
    console.log('Haciendo público el formulario ID:', formId);
    
    const { error } = await this.supabase
      .from('form_configs')
      .update({ is_public: true })
      .eq('id', formId)
      .eq('created_by', (await this.supabase.auth.getUser()).data.user?.id);

    if (error) {
      console.error('Error haciendo público el formulario:', error);
      throw error;
    }
    
    console.log('Formulario marcado como público exitosamente');
    
    // Retornar el mismo ID como "token"
    return formId;
  }

  // Desactivar compartir (quitar token)
  async disableSharing(formId: string): Promise<void> {
    const { error } = await this.supabase
      .from('form_configs')
      .update({ is_public: false, share_token: null })
      .eq('id', formId);

    if (error) throw error;
  }

  // Enviar respuesta a un formulario
  async submitResponse(formId: string, responses: Record<string, any>): Promise<void> {
    const { error } = await this.supabase
      .from('form_responses')
      .insert({
        form_config_id: formId,
        responses,
        user_agent: navigator.userAgent
      });

    if (error) throw error;
  }

  // Obtener respuestas de un formulario
  async getFormResponses(formId: string): Promise<DatabaseFormResponse[]> {
    const { data, error } = await this.supabase
      .from('form_responses')
      .select('*')
      .eq('form_config_id', formId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Obtener estadísticas de un formulario
  async getFormStats(formId: string) {
    const { data, error } = await this.supabase
      .from('form_stats')
      .select('*')
      .eq('id', formId)
      .single();

    if (error) throw error;
    return data;
  }

  // Exportar respuestas como CSV
  async exportResponsesAsCSV(formId: string): Promise<string> {
    const responses = await this.getFormResponses(formId);
    const form = await this.getForm(formId);
    
    if (!form || responses.length === 0) {
      return '';
    }

    // Obtener todas las claves de respuestas
    const allKeys = new Set<string>();
    responses.forEach(response => {
      Object.keys(response.responses).forEach(key => allKeys.add(key));
    });

    // Crear encabezados
    const headers = ['Fecha de envío', ...Array.from(allKeys)];
    
    // Crear filas
    const rows = responses.map(response => {
      const row = [new Date(response.submitted_at).toLocaleString()];
      allKeys.forEach(key => {
        row.push(response.responses[key] || '');
      });
      return row;
    });

    // Convertir a CSV
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // Duplicar un formulario
  async duplicateForm(formId: string, newTitle?: string): Promise<FormConfig> {
    const originalForm = await this.getForm(formId);
    if (!originalForm) throw new Error('Formulario no encontrado');

    const duplicatedConfig: FormConfig = {
      ...originalForm,
      id: '', // Se generará uno nuevo
      title: newTitle || `${originalForm.title} (Copia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this.createForm(duplicatedConfig);
  }
}