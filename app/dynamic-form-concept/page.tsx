'use client';

import { useState, useEffect } from 'react';
import { FormConfig, FormResponse } from '@/types/form-builder';
import { FormService, DatabaseFormResponse } from '@/lib/supabase/form-service';
import FormBuilder from '@/components/FormBuilder';
import DynamicForm from '@/components/DynamicForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Download, Upload, Trash2, Eye, Settings, BarChart3, Users, Share, RefreshCw } from 'lucide-react';

export default function DynamicFormConceptPage() {
  const formService = new FormService();
  const [savedForms, setSavedForms] = useState<FormConfig[]>([]);
  const [currentForm, setCurrentForm] = useState<FormConfig | null>(null);
  const [activeTab, setActiveTab] = useState('builder');
  const [isLoading, setIsLoading] = useState(true);
  const [responses, setResponses] = useState<DatabaseFormResponse[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);

  // Cargar formularios guardados de Supabase
  useEffect(() => {
    loadForms();
  }, []);

  // Cargar respuestas cuando cambia el formulario actual o se selecciona el tab de analytics
  useEffect(() => {
    if (currentForm && activeTab === 'analytics') {
      loadResponses(currentForm.id);
    }
  }, [currentForm, activeTab]);

  const loadForms = async () => {
    setIsLoading(true);
    try {
      const forms = await formService.getUserForms();
      setSavedForms(forms);
    } catch (error) {
      console.error('Error loading forms:', error);
      toast.error('Error al cargar los formularios');
    } finally {
      setIsLoading(false);
    }
  };

  const loadResponses = async (formId: string) => {
    setLoadingResponses(true);
    try {
      const formResponses = await formService.getFormResponses(formId);
      setResponses(formResponses);
    } catch (error) {
      console.error('Error loading responses:', error);
      toast.error('Error al cargar las respuestas');
    } finally {
      setLoadingResponses(false);
    }
  };

  // Guardar formulario
  const handleSaveForm = (config: FormConfig) => {
    const existingIndex = savedForms.findIndex(f => f.id === config.id);
    let updatedForms;
    
    if (existingIndex >= 0) {
      // Actualizar existente
      updatedForms = [...savedForms];
      updatedForms[existingIndex] = config;
    } else {
      // Agregar nuevo
      updatedForms = [...savedForms, config];
    }
    
    setSavedForms(updatedForms);
    setCurrentForm(config);
  };

  // Cargar formulario para editar
  const handleLoadForm = (formId: string) => {
    const form = savedForms.find(f => f.id === formId);
    if (form) {
      setCurrentForm(form);
      setActiveTab('builder');
      toast.success('Formulario cargado');
    }
  };

  // Eliminar formulario
  const handleDeleteForm = async (formId: string) => {
    try {
      await formService.deleteForm(formId);
      const updatedForms = savedForms.filter(f => f.id !== formId);
      setSavedForms(updatedForms);
      
      if (currentForm?.id === formId) {
        setCurrentForm(null);
      }
      
      toast.success('Formulario eliminado');
    } catch (error) {
      console.error('Error deleting form:', error);
      toast.error('Error al eliminar formulario');
    }
  };

  // Crear nuevo formulario
  const handleNewForm = () => {
    setCurrentForm(null);
    setActiveTab('builder');
  };

  // Exportar configuración JSON
  const handleExportJSON = (config: FormConfig) => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.title.replace(/\s+/g, '_')}_config.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Importar configuración JSON
  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string) as FormConfig;
        config.id = `imported_${Date.now()}`; // Nuevo ID para evitar conflictos
        config.updatedAt = new Date().toISOString();
        setCurrentForm(config);
        setActiveTab('builder');
        toast.success('Configuración importada');
      } catch (error) {
        toast.error('Error al importar el archivo JSON');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  // Manejar envío del formulario dinámico
  const handleFormSubmit = async (data: Record<string, any>) => {
    if (!currentForm?.id) {
      toast.error('Error: Formulario no válido');
      return;
    }

    try {
      await formService.submitResponse(currentForm.id, data);
      toast.success('¡Formulario enviado correctamente!');
      console.log('Form submitted:', data);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error al enviar el formulario');
    }
  };

  // Manejar compartir formulario
  const handleShare = (shareToken: string) => {
    const shareUrl = `${window.location.origin}/form/${shareToken}`;
    console.log('Share URL:', shareUrl);
  };

  // Generar enlace de compartir para un formulario específico
  const handleShareForm = async (formId: string) => {
    try {
      // Buscar el formulario en la lista actual
      const existingForm = savedForms.find(f => f.id === formId);
      
      // Si no está marcado como público, marcarlo
       if (!existingForm || !existingForm.shareToken) {
         console.log('Haciendo público el formulario:', formId);
         await formService.generateShareToken(formId);
         console.log('Formulario marcado como público');
       }
      
      // Usar directamente el UUID del formulario como "token"
      const shareUrl = `${window.location.origin}/form/${formId}`;
      console.log('URL de compartir:', shareUrl);
      
      // Copiar al portapapeles
      await navigator.clipboard.writeText(shareUrl);
      
      toast.success('Enlace de compartir copiado al portapapeles');
      
      // Actualizar la lista de formularios para mostrar el estado compartido
      await loadForms();
    } catch (error: any) {
      console.error('Error generating share link:', error);
      const errorMessage = error?.message || 'Error al generar enlace de compartir';
      toast.error(errorMessage);
    }
  };

  // Duplicar formulario
  const handleDuplicateForm = async (formId: string) => {
    try {
      const duplicated = await formService.duplicateForm(formId);
      setSavedForms(prev => [duplicated, ...prev]);
      toast.success('Formulario duplicado');
    } catch (error) {
      console.error('Error duplicating form:', error);
      toast.error('Error al duplicar formulario');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Constructor de Formularios Dinámicos</h1>
        <p className="text-gray-600">
          Crea formularios personalizados con diferentes tipos de campos. 
          La configuración se guarda como JSON y puede ser reutilizada.
        </p>
      </div>

      {/* Panel de control */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Panel de Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <Button onClick={handleNewForm}>
              Nuevo Formulario
            </Button>
            
            {savedForms.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Cargar:</span>
                <Select onValueChange={handleLoadForm}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Selecciona un formulario" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedForms.map(form => (
                      <SelectItem key={form.id} value={form.id}>
                        {form.title} ({new Date(form.updatedAt).toLocaleDateString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
                id="import-json"
              />
              <Button variant="outline" onClick={() => document.getElementById('import-json')?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Importar JSON
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Formularios */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Mis Formularios ({savedForms.length})</span>
            {isLoading && <span className="text-sm font-normal text-gray-500">Cargando...</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Cargando formularios...</p>
            </div>
          ) : savedForms.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No tienes formularios creados aún</p>
              <p className="text-sm text-gray-400">Usa el constructor de abajo para crear tu primer formulario</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Vista de tabla para mejor organización */}
              <div className="hidden md:block">
                <div className="grid grid-cols-12 gap-4 pb-2 border-b text-sm font-medium text-gray-600">
                  <div className="col-span-4">Nombre</div>
                  <div className="col-span-2">Campos</div>
                  <div className="col-span-2">Estado</div>
                  <div className="col-span-2">Actualizado</div>
                  <div className="col-span-2">Acciones</div>
                </div>
                {savedForms.map(form => (
                  <div key={form.id} className="grid grid-cols-12 gap-4 py-3 border-b hover:bg-gray-50">
                    <div className="col-span-4">
                      <h3 className="font-medium">{form.title}</h3>
                      {form.description && (
                        <p className="text-sm text-gray-600 truncate">{form.description}</p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm">{form.fields.length} campos</span>
                    </div>
                    <div className="col-span-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        form.shareToken ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {form.shareToken ? 'Compartido' : 'Privado'}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-600">
                        {new Date(form.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLoadForm(form.id)}
                          title="Editar"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCurrentForm(form);
                            setActiveTab('preview');
                          }}
                          title="Vista previa"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleShareForm(form.id)}
                          title="Compartir"
                        >
                          <Share className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExportJSON(form)}
                          title="Exportar"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteForm(form.id)}
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Vista de tarjetas para móvil */}
              <div className="md:hidden grid gap-4">
                {savedForms.map(form => (
                  <div key={form.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium">{form.title}</h3>
                        {form.description && (
                          <p className="text-sm text-gray-600 mt-1">{form.description}</p>
                        )}
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        form.shareToken ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {form.shareToken ? 'Compartido' : 'Privado'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {form.fields.length} campos • {new Date(form.updatedAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLoadForm(form.id)}
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setCurrentForm(form);
                          setActiveTab('preview');
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShareForm(form.id)}
                      >
                        <Share className="w-4 h-4 mr-1" />
                        Compartir
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExportJSON(form)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Exportar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteForm(form.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">Constructor</TabsTrigger>
          <TabsTrigger value="preview" disabled={!currentForm}>
            Vista Previa {currentForm ? `(${currentForm.title})` : ''}
          </TabsTrigger>
          <TabsTrigger value="analytics" disabled={!currentForm}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Analíticas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="builder" className="mt-6">
          <FormBuilder
            initialConfig={currentForm || undefined}
            onSave={handleSaveForm}
            onShare={handleShare}
          />
        </TabsContent>
        
        <TabsContent value="preview" className="mt-6">
          {currentForm ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Vista Previa: {currentForm.title}</h2>
                <div className="flex gap-2">
                  {currentForm.shareToken && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const shareUrl = `${window.location.origin}/form/${currentForm.shareToken}`;
                        navigator.clipboard.writeText(shareUrl);
                        toast.success('URL copiada al portapapeles');
                      }}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Copiar URL
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleExportJSON(currentForm)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar JSON
                  </Button>
                </div>
              </div>
              <DynamicForm
                config={currentForm}
                onSubmit={handleFormSubmit}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Selecciona o crea un formulario para ver la vista previa</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          {currentForm ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Respuestas: {currentForm.title}</h2>
                <Button 
                  onClick={() => loadResponses(currentForm.id)}
                  disabled={loadingResponses}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loadingResponses ? 'animate-spin' : ''}`} />
                  Actualizar
                </Button>
              </div>
              
              {loadingResponses ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Cargando respuestas...</span>
                    </div>
                  </CardContent>
                </Card>
              ) : responses.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    Total de respuestas: {responses.length}
                  </div>
                  
                  {responses.map((response, index) => (
                    <Card key={response.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">Respuesta #{index + 1}</CardTitle>
                          <span className="text-sm text-gray-500">
                            {new Date(response.submitted_at).toLocaleString('es-ES')}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4">
                          {currentForm.fields.map((field) => {
                            const value = response.responses[field.id];
                            if (!value && value !== 0 && value !== false) return null;
                            
                            return (
                              <div key={field.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                                <label className="text-sm font-medium text-gray-700 block mb-1">
                                  {field.label}
                                  {field.required && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                
                                {field.type === 'image' || field.type === 'file' ? (
                                  <div className="space-y-2">
                                    {Array.isArray(value) ? (
                                      value.map((url: string, idx: number) => (
                                        <div key={idx}>
                                          {field.type === 'image' ? (
                                            <div className="relative inline-block">
                                              <img 
                                                src={url} 
                                                alt={`${field.label} ${idx + 1}`}
                                                className="max-w-xs max-h-48 object-contain border rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                                onClick={() => window.open(url, '_blank')}
                                              />
                                              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                                {idx + 1}
                                              </div>
                                            </div>
                                          ) : (
                                            <a 
                                              href={url} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center text-blue-600 hover:text-blue-800 underline"
                                            >
                                              📎 Archivo {idx + 1}
                                            </a>
                                          )}
                                        </div>
                                      ))
                                    ) : (
                                      field.type === 'image' ? (
                                        <img 
                                          src={value} 
                                          alt={field.label}
                                          className="max-w-xs max-h-48 object-contain border rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                          onClick={() => window.open(value, '_blank')}
                                        />
                                      ) : (
                                        <a 
                                          href={value} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center text-blue-600 hover:text-blue-800 underline"
                                        >
                                          📎 Ver archivo
                                        </a>
                                      )
                                    )}
                                  </div>
                                ) : field.type === 'checkbox' ? (
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {value ? '✓ Sí' : '✗ No'}
                                  </span>
                                ) : field.type === 'select' && Array.isArray(value) ? (
                                  <div className="flex flex-wrap gap-1">
                                    {value.map((item: string, idx: number) => (
                                      <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {item}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-gray-900 bg-gray-50 p-2 rounded border">
                                    {typeof value === 'string' && value.length > 100 ? (
                                      <details>
                                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                                          {value.substring(0, 100)}... (ver más)
                                        </summary>
                                        <div className="mt-2 whitespace-pre-wrap">{value}</div>
                                      </details>
                                    ) : (
                                      <span className="whitespace-pre-wrap">{String(value)}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay respuestas para este formulario aún.</p>
                    <p className="text-sm mt-2">Las respuestas aparecerán aquí cuando alguien complete el formulario.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Selecciona un formulario para ver las respuestas</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}