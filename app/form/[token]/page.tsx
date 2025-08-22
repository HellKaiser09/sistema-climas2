'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FormConfig } from '@/types/form-builder';
import { FormService } from '@/lib/supabase/form-service';
import DynamicForm from '@/components/DynamicForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function PublicFormPage() {
  const params = useParams();
  const formId = params.token as string; // Ahora es el ID del formulario directamente
  const formService = new FormService();
  
  const [form, setForm] = useState<FormConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (formId) {
      loadForm();
    }
  }, [formId]);

  const loadForm = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Cargando formulario con ID:', formId);
      const formData = await formService.getFormByShareToken(formId);
      console.log('Datos del formulario recibidos:', formData);
      
      if (formData) {
        setForm(formData);
      } else {
        console.log('No se encontró formulario público para el ID:', formId);
        setError('Formulario no encontrado o no está disponible públicamente');
      }
    } catch (error) {
      console.error('Error loading form:', error);
      setError('Error al cargar el formulario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    if (!form?.id) {
      toast.error('Error: Formulario no válido');
      return;
    }

    try {
      await formService.submitResponse(form.id, data);
      setIsSubmitted(true);
      toast.success('¡Formulario enviado correctamente!');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error al enviar el formulario');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Cargando formulario...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-4 text-green-600" />
            <h2 className="text-lg font-semibold mb-2">¡Enviado!</h2>
            <p className="text-gray-600">
              Tu respuesta ha sido enviada correctamente. Gracias por participar.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
            <h2 className="text-lg font-semibold mb-2">Formulario no encontrado</h2>
            <p className="text-gray-600">
              El formulario que buscas no existe o el enlace ha expirado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">{form.title}</CardTitle>
            {form.description && (
              <p className="text-center text-gray-600 mt-2">{form.description}</p>
            )}
          </CardHeader>
          <CardContent>
            <DynamicForm
              config={form}
              onSubmit={handleFormSubmit}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}