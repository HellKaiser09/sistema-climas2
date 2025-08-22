import EmpresaRegistrationForm from '@/components/EmpresaForm';
import { Button } from '@/components/ui/button';
import MainLayout from '@/Layouts/MainLayout';
import { ArrowRight } from 'lucide-react';

export default function EmpresaRegistroPage() {

  return (
    <MainLayout>
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Feria del Empleo <span className="text-tecmilenio block">San Nicolás</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Completa el formulario para registrar tu empresa y participar en el evento.
            </p>
          </div>
        </div>
      </section>
      <div className="min-h-screen bg-gray-50 ">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Formulario de Registro 
              </h2>
            </div>
            <EmpresaRegistrationForm />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}