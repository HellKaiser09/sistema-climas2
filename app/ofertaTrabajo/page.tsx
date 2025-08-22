'use client'
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// Crear cliente de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function OfertaEmpleo() {
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [career, setCareer] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const storedCareer = localStorage.getItem('userCareer');
    if (storedCareer) {
      setCareer(storedCareer);
      fetchEmpresas(storedCareer);
    }
  }, []);

  const fetchEmpresas = async (career: string) => {
    try {
      const { data, error } = await supabase
        .from('RegistroEmpresas')
        .select('*')
        .like('carreraBuscada', `%${career}%`);

      if (error) throw error;
      setEmpresas(data);
    } catch (error) {
      console.error('Error al obtener empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-white">Cargando...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-custom-green text-white">
      <div className="flex-grow">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Empresas que buscan {career}</h1>
            <p className="text-lg">
              Aquí puedes encontrar empresas que están buscando tu perfil. ¡Acércate a los módulos y pide informes!
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 text-custom-green">
            {empresas.length === 0 ? (
              <p>No hay empresas buscando tu carrera en este momento.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {empresas.map((empresa) => {
                  // Obtener la URL del logo desde la columna 'logo'
                  const logoUrl = empresa.logo;

                  return (
                    <div key={empresa.id} className="border p-4 rounded-lg shadow-lg hover:shadow-xl">
                      <div className="flex justify-center">
                        {/* Mostrar el logo usando la URL guardada */}
                        <Image
                          src={logoUrl}
                          alt={`Logo de ${empresa.nombreEmpresa}`}
                          width={100}
                          height={100}
                          className="rounded-md"
                        />
                      </div>
                      <h2 className="text-xl font-bold text-custom-green mt-5">{empresa.nombreEmpresa}</h2>
                      <p className="mt-2">Colaborador: {empresa.nombreColaborador}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
