'use client';

import { Button } from '@/components/ui/button';
import { Upload, X, FileImage } from 'lucide-react';
import { useState, useRef } from 'react';
import { Card, CardContent } from './ui/card';

interface CloudinaryUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
}

export default function CloudinaryUpload({
  value,
  onChange,
  onRemove
}: CloudinaryUploadProps) {
  const [imageError, setImageError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Limpiar estados previos
    setImageError(false);
    setErrorMessage('');

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setImageError(true);
      setErrorMessage('Solo se permiten archivos JPG y PNG');
      return;
    }

    // Validar tamaño de archivo (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > maxSize) {
      setImageError(true);
      setErrorMessage('El archivo es muy grande. Máximo 5MB');
      return;
    }

    setIsUploading(true);

    // Crear URL temporal para vista previa
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result);
      setShowSuccess(true);
      setIsUploading(false);
      setTimeout(() => setShowSuccess(false), 2000);
    };
    reader.onerror = () => {
      setImageError(true);
      setErrorMessage('Error al leer el archivo');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
      setImageError(false);
      setErrorMessage('');
      setShowSuccess(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          disabled={isUploading}
          className="flex items-center gap-2 flex-1"
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              Cargando...
            </>
          ) : (
            <>
              <FileImage className="h-4 w-4" />
              {value ? 'Cambiar Logo' : 'Seleccionar Logo'}
            </>
          )}
        </Button>
        {value && onRemove && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="text-xs text-gray-500">
        Formatos permitidos: JPG, PNG • Tamaño máximo: 5MB
      </div>

      {showSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-green-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            ¡Imagen cargada exitosamente!
          </div>
        </div>
      )}

      {imageError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
            {errorMessage}
          </div>
        </div>
      )}
      {value &&

        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 group opacity-100 group-hover/grid:opacity-50 hover:!opacity-100">
          <CardContent className="p-6 flex items-center justify-center h-24 overflow-hidden">
            <img
              src={value}
              className="object-cover max-w-[350px] object-center transition-all duration-300"
            />
          </CardContent>
        </Card>
      }
      {/* Vista previa de la imagen */}
      {value && (
        <div className="mt-4 space-y-3">
          <div className="relative">
            <div className="relative w-full h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
              {imageError ? (
                <div className="w-full h-full flex items-center justify-center text-red-500">
                  <div className="text-center">
                    <X className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Error al cargar imagen</p>
                  </div>
                </div>
              ) : (
                <img
                  src={value}
                  alt="Logo preview"
                  className="w-full h-full object-contain"
                  onLoad={() => {
                    console.log('🖼️ Image loaded successfully:', value);
                    setImageError(false);
                  }}
                  onError={(e) => {
                    console.error('❌ Image failed to load:', value, e);
                    setImageError(true);
                  }}
                />
              )}
            </div>
            {onRemove && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 shadow-md"
                onClick={handleRemove}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            Archivo cargado correctamente
          </div>
        </div>
      )}
    </div>
  );
}