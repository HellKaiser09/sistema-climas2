import EmpresaForm from '@/components/EmpresaForm';

export default function EmpresaPage() {
  return (
    <div className="min-h-screen bg-custom-green py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Registro de Empresas</h1>
          <p className="text-lg text-gray-100">
            Completa el formulario para registrar tu empresa en la feria de empleo.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <EmpresaForm />
        </div>
      </div>
    </div>
  );
}