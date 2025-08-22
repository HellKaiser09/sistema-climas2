'use client'
import { Empresa } from '@/app/types';
import { createClient } from '@/lib/supabase/client';
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Building2, User, Mail, Calendar, Briefcase } from 'lucide-react';

export default function EmpresasBlock({ limit }: { limit?: number }) {
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEmpresas = async () => {
            try {
                const supabase = createClient();
                let query = supabase.from('RegistroEmpresas').select('*');
                if (limit) {
                    query = query.limit(limit);
                }
                const { data, error } = await query;

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
        <div className='max-w-6xl px-4 mx-auto'>
            {isLoading ? (
                <div className="text-center">Cargando empresas...</div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                    {empresas.map((empresa, index) => (
                        <Dialog key={index}>
                            <DialogTrigger asChild>
                                <Card className="cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300 transform group">
                                    <CardContent className="p-0">
                                        <div className="relative h-32  flex items-center justify-center overflow-hidden rounded-t-lg">
                                            <img
                                                src={empresa.logo || "/placeholder-logo.png"}
                                                alt={`${empresa.nombreEmpresa} logo`}
                                                className="object-cover max-w-full object-center transition-all duration-300"
                                            />
                                        </div>
                                        {!limit &&
                                                <div className="p-4">
                                                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
                                                    {empresa.nombreEmpresa}
                                                </h3>
                                                <div className="flex items-center text-sm text-gray-600 mb-2">
                                                    <Briefcase className="w-4 h-4 mr-2" />
                                                    <span className="line-clamp-1">{empresa.carreraBuscada}</span>
                                                </div>
                                                {empresa.descripcion && (
                                                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                                                        {empresa.descripcion}
                                                    </p>
                                                )}
                                                <div className="flex justify-between items-center">
                                                    <Badge variant="secondary" className="text-xs">
                                                        Ver más
                                                    </Badge>
                                                    <div className="text-xs text-gray-400">
                                                        {new Date(empresa.created_at).toLocaleDateString('es-MX')}
                                                    </div>
                                                </div>
                                            </div>}
                                    </CardContent>
                                </Card>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-3">
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                                            <img
                                                src={empresa.logo || "/placeholder-logo.png"}
                                                alt={`${empresa.nombreEmpresa} logo`}
                                                className="max-h-8 w-full object-contain"
                                            />
                                        </div>
                                        {empresa.nombreEmpresa}
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6">
                                    {empresa.descripcion && (
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Descripción</h4>
                                            <p className="text-gray-700 leading-relaxed">
                                                {empresa.descripcion}
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <User className="w-5 h-5 text-blue-600" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Contacto</p>
                                                    <p className="text-sm text-gray-600">{empresa.nombreColaborador}</p>
                                                </div>
                                            </div>

                                            {empresa.correo && (
                                                <div className="flex items-center gap-3">
                                                    <Mail className="w-5 h-5 text-blue-600" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">Email</p>
                                                        <a
                                                            href={`mailto:${empresa.correo}`}
                                                            className="text-sm text-blue-600 hover:underline"
                                                        >
                                                            {empresa.correo}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <Briefcase className="w-5 h-5 text-blue-600" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Carrera Buscada</p>
                                                    <p className="text-sm text-gray-600">{empresa.carreraBuscada}</p>
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    {empresa.correo && (
                                        <div className="border-t pt-4">
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => window.open(`mailto:${empresa.correo}`, '_blank')}
                                                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                    Contactar
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    ))}
                </div>
            )}
        </div>
    )
}
