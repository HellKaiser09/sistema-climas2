'use client';

import { useState } from 'react';
import { FormConfig, FormField } from '@/types/form-builder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { uploadToCloudinary } from '@/lib/cloudinary';

interface DynamicFormProps {
  config: FormConfig;
  onSubmit: (data: Record<string, any>) => void;
  initialData?: Record<string, any>;
}

export default function DynamicForm({ config, onSubmit, initialData = {} }: DynamicFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    // Limpiar error si existe
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    config.fields.forEach(field => {
      const value = formData[field.id];
      
      // Validar campos requeridos
      if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        newErrors[field.id] = `${field.label} es requerido`;
        return;
      }

      // Validaciones específicas por tipo
      if (value) {
        switch (field.type) {
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              newErrors[field.id] = 'Email inválido';
            }
            break;
          case 'number':
            const numField = field as any;
            const numValue = Number(value);
            if (isNaN(numValue)) {
              newErrors[field.id] = 'Debe ser un número válido';
            } else {
              if (numField.min !== undefined && numValue < numField.min) {
                newErrors[field.id] = `Valor mínimo: ${numField.min}`;
              }
              if (numField.max !== undefined && numValue > numField.max) {
                newErrors[field.id] = `Valor máximo: ${numField.max}`;
              }
            }
            break;
          case 'text':
            const textField = field as any;
            if (textField.minLength && value.length < textField.minLength) {
              newErrors[field.id] = `Mínimo ${textField.minLength} caracteres`;
            }
            if (textField.maxLength && value.length > textField.maxLength) {
              newErrors[field.id] = `Máximo ${textField.maxLength} caracteres`;
            }
            break;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    setIsSubmitting(true);
    try {
      // Procesar archivos e imágenes
      const processedData = { ...formData };
      
      for (const [fieldId, value] of Object.entries(formData)) {
        if (value instanceof File) {
          try {
            const uploadedUrl = await uploadToCloudinary(value);
            processedData[fieldId] = uploadedUrl;
          } catch (error) {
            toast.error(`Error al subir archivo: ${value.name}`);
            setIsSubmitting(false);
            return;
          }
        }
      }
      
      await onSubmit(processedData);
      toast.success('Formulario enviado correctamente');
    } catch (error) {
      toast.error('Error al enviar el formulario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id] || '';
    const error = errors[field.id];

    const commonProps = {
      id: field.id,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
        updateField(field.id, e.target.value)
    };

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              {...commonProps}
              type={field.type}
              placeholder={field.placeholder}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );

      case 'number':
        const numField = field as any;
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              {...commonProps}
              type="number"
              min={numField.min}
              max={numField.max}
              placeholder={field.placeholder}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );

      case 'textarea':
        const textareaField = field as any;
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              {...commonProps}
              rows={textareaField.rows || 3}
              maxLength={textareaField.maxLength}
              placeholder={field.placeholder}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );

      case 'select':
        const selectField = field as any;
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(newValue) => updateField(field.id, newValue)}
            >
              <SelectTrigger className={error ? 'border-red-500' : ''}>
                <SelectValue placeholder={field.placeholder || 'Selecciona una opción'} />
              </SelectTrigger>
              <SelectContent>
                {selectField.options?.map((option: any) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={field.id}
                checked={!!value}
                onChange={(e) => updateField(field.id, e.target.checked)}
                className="rounded"
              />
              <Label htmlFor={field.id}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );

      case 'file':
      case 'image':
        const fileField = field as any;
        const fileValue = value as File;
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="file"
              accept={field.type === 'image' ? 'image/*' : fileField.acceptedTypes?.join(',')}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Validar tamaño si está especificado
                  if (fileField.maxSize && file.size > fileField.maxSize * 1024 * 1024) {
                    setErrors(prev => ({ 
                      ...prev, 
                      [field.id]: `El archivo debe ser menor a ${fileField.maxSize}MB` 
                    }));
                    return;
                  }
                  updateField(field.id, file);
                }
              }}
              className={error ? 'border-red-500' : ''}
            />
            {fileValue && (
              <div className="mt-2 p-2 bg-gray-50 rounded border">
                <p className="text-sm text-gray-600">Archivo seleccionado: {fileValue.name}</p>
                {field.type === 'image' && (
                  <img 
                    src={URL.createObjectURL(fileValue)} 
                    alt="Vista previa" 
                    className="mt-2 max-w-xs max-h-32 object-contain rounded"
                  />
                )}
              </div>
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  // Ordenar campos por order
  const sortedFields = [...config.fields].sort((a, b) => a.order - b.order);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
        {config.description && (
          <p className="text-gray-600">{config.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {sortedFields.map(renderField)}
          
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : (config.submitButtonText || 'Enviar')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}