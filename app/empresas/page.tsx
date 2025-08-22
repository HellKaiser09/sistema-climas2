'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import MainLayout from '@/Layouts/MainLayout';
import { Empresa } from '../types';
import EmpresasBlock from '@/components/EmpresasBlock';

export default function EmpresasPage() {
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEmpresas = async () => {
            try {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from('RegistroEmpresas')
                    .select('*');

                if (error) throw error;
                if (data) setEmpresas(data);
            } catch (error) {
                console.error('Error fetching empresas:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEmpresas();
    }, []);
    return (
        <MainLayout>
            <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                            Feria del Empleo <span className="text-tecmilenio block">+{empresas.length} Empresas Participantes</span>
                        </h1>
                    </div>
                </div>
            </section>
            <div>

                <EmpresasBlock />
            </div>
        </MainLayout >
    )
}
