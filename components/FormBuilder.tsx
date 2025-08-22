'use client';

import { useState } from 'react';
import { FormField, FormConfig } from '@/types/form-builder';
import { FormService } from '@/lib/supabase/form-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Plus, ArrowUp, ArrowDown, Edit, Share, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface FormBuilderProps {
  initialConfig?: FormConfig;
  onSave: (config: FormConfig) => void;
  onShare?: (shareToken: string) => void;
}

export default function FormBuilder({ initialConfig, onSave, onShare }: FormBuilderProps) {
  const formService = new FormService();
  const [config, setConfig] = useState<FormConfig>(initialConfig || {
    id: '',
    title: '',
    description: '',
    fields: [],
    submitButtonText: 'Enviar',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [isAddingField, setIsAddingField] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const [newField, setNewField] = useState<Partial<FormField>>({
    type: 'text',
    label: '',
    placeholder: '',
    required: false
  });

  const fieldTypes = [
    { value: 'text', label: 'Texto' },
    { value: 'email', label: 'Email' },
    { value: 'number', label: 'Número' },
    { value: 'select', label: 'Selección' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'textarea', label: 'Área de texto' },
    { value: 'file', label: 'Archivo' },
    { value: 'image', label: 'Imagen' }
  ];

  const addField = () => {
    if (!newField.label || !newField.type) {
      toast.error('El label y tipo son requeridos');
      return;
    }

    const field: FormField = {
      id: `field_${Date.now()}`,
      type: newField.type as any,
      label: newField.label,
      placeholder: newField.placeholder,
      required: newField.required || false,
      order: config.fields.length
    } as FormField;

    setConfig(prev => ({
      ...prev,
      fields: [...prev.fields, field],
      updatedAt: new Date().toISOString()
    }));

    setNewField({
      type: 'text',
      label: '',
      placeholder: '',
      required: false
    });
    setIsAddingField(false);
    toast.success('Campo agregado');
  };

  const removeField = (fieldId: string) => {
    setConfig(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId).map((f, index) => ({ ...f, order: index })),
      updatedAt: new Date().toISOString()
    }));
    toast.success('Campo eliminado');
  };

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    const fieldIndex = config.fields.findIndex(f => f.id === fieldId);
    if (
      (direction === 'up' && fieldIndex === 0) ||
      (direction === 'down' && fieldIndex === config.fields.length - 1)
    ) {
      return;
    }

    const newFields = [...config.fields];
    const targetIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;
    [newFields[fieldIndex], newFields[targetIndex]] = [newFields[targetIndex], newFields[fieldIndex]];
    
    // Actualizar orden
    newFields.forEach((field, index) => {
      field.order = index;
    });

    setConfig(prev => ({
      ...prev,
      fields: newFields,
      updatedAt: new Date().toISOString()
    }));
  };

  const saveConfig = async () => {
    if (!config.title) {
      toast.error('El título del formulario es requerido');
      return;
    }

    if (config.fields.length === 0) {
      toast.error('Agrega al menos un campo');
      return;
    }

    setIsSaving(true);
    try {
      const finalConfig = {
        ...config,
        id: config.id || `form_${Date.now()}`,
        updatedAt: new Date().toISOString()
      };

      let savedConfig;
      if (config.id && initialConfig) {
        // Actualizar existente
        savedConfig = await formService.updateForm(config.id, finalConfig);
      } else {
        // Crear nuevo
        savedConfig = await formService.createForm(finalConfig);
      }

      onSave(savedConfig);
      toast.success('Formulario guardado en Supabase');
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error('Error al guardar el formulario');
    } finally {
      setIsSaving(false);
    }
  };

  const generateShareLink = async () => {
    if (!config.id) {
      toast.error('Guarda el formulario primero');
      return;
    }

    setIsGeneratingShare(true);
    try {
      const shareToken = await formService.generateShareToken(config.id);
      const shareUrl = `${window.location.origin}/form/${shareToken}`;
      
      // Copiar al portapapeles
      await navigator.clipboard.writeText(shareUrl);
      
      toast.success('Enlace copiado al portapapeles');
      if (onShare) {
        onShare(shareToken);
      }
    } catch (error) {
      console.error('Error generating share link:', error);
      toast.error('Error al generar enlace de compartir');
    } finally {
      setIsGeneratingShare(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuración del formulario */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración del Formulario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Título del formulario</Label>
            <Input
              id="title"
              value={config.title}
              onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ej: Registro de Empresas"
            />
          </div>
          <div>
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              value={config.description || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción del formulario"
            />
          </div>
          <div>
            <Label htmlFor="submitText">Texto del botón de envío</Label>
            <Input
              id="submitText"
              value={config.submitButtonText || 'Enviar'}
              onChange={(e) => setConfig(prev => ({ ...prev, submitButtonText: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de campos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Campos del Formulario ({config.fields.length})</CardTitle>
          <Dialog open={isAddingField} onOpenChange={setIsAddingField}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Campo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Campo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Tipo de campo</Label>
                  <Select
                    value={newField.type}
                    onValueChange={(value) => setNewField(prev => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Etiqueta</Label>
                  <Input
                    value={newField.label || ''}
                    onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="Ej: Nombre de la empresa"
                  />
                </div>
                <div>
                  <Label>Placeholder (opcional)</Label>
                  <Input
                    value={newField.placeholder || ''}
                    onChange={(e) => setNewField(prev => ({ ...prev, placeholder: e.target.value }))}
                    placeholder="Texto de ayuda"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="required"
                    checked={newField.required || false}
                    onChange={(e) => setNewField(prev => ({ ...prev, required: e.target.checked }))}
                  />
                  <Label htmlFor="required">Campo requerido</Label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addField}>Agregar</Button>
                  <Button variant="outline" onClick={() => setIsAddingField(false)}>Cancelar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {config.fields.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay campos agregados</p>
          ) : (
            <div className="space-y-2">
              {config.fields.map((field, index) => (
                <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{field.label}</div>
                    <div className="text-sm text-gray-500">
                      Tipo: {fieldTypes.find(t => t.value === field.type)?.label} 
                      {field.required && ' • Requerido'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveField(field.id, 'up')}
                      disabled={index === 0}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveField(field.id, 'down')}
                      disabled={index === config.fields.length - 1}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(field.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vista previa del JSON */}
      <Card>
        <CardHeader>
          <CardTitle>Vista Previa JSON</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-60">
            {JSON.stringify(config, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3">
        {config.id && (
          <Button 
            variant="outline" 
            onClick={generateShareLink}
            disabled={isGeneratingShare}
            size="lg"
          >
            <Share className="w-4 h-4 mr-2" />
            {isGeneratingShare ? 'Generando...' : 'Compartir'}
          </Button>
        )}
        <Button 
          onClick={saveConfig} 
          disabled={isSaving}
          size="lg"
        >
          {isSaving ? 'Guardando...' : 'Guardar Formulario'}
        </Button>
      </div>
    </div>
  );
}