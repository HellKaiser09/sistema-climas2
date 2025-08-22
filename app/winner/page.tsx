'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Student {
    name: string;
    matricula: string;
    career: string;
    campus: string;
    semester: number;
    userType: 'student' | 'alumni';
}

export default function WinnerPage() {
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
    const [previousWinners, setPreviousWinners] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load students from Supabase
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setIsLoading(true);
                const supabase = createClient();

                const { data, error } = await supabase
                    .from('RegistroTecmi')
                    .select('*');

                if (error) throw error;
                if (data) {
                    const studentsData = data as Student[];
                    setStudents(studentsData);
                    setAvailableStudents(studentsData);
                }
            } catch (err) {
                console.error('Error fetching students:', err);
                toast.error('Error al cargar los datos');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudents();
    }, []);

    const triggerConfetti = () => {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 },
            zIndex: 999
        };

        function fire(particleRatio: number, opts: any) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }

        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        });

        fire(0.2, {
            spread: 60,
        });

        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    };

    const selectRandomWinner = () => {
        setIsSelecting(true);

        setTimeout(() => {
            if (availableStudents.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableStudents.length);
                const winner = availableStudents[randomIndex];

                // Actualizar el ganador seleccionado
                setSelectedStudent(winner);
                
                // Agregar el ganador a la lista de ganadores previos
                setPreviousWinners(prev => [...prev, winner]);
                
                // Filtrar el ganador de la lista de estudiantes disponibles
                setAvailableStudents(prev => prev.filter(student => student.matricula !== winner.matricula));
                
                triggerConfetti();
                toast.success('¡Ganador seleccionado!');
            } else {
                toast.error('No hay estudiantes disponibles');
            }

            setIsSelecting(false);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-custom-green py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl font-bold text-white mb-4">¡Selección del Ganador!</h1>
                    <p className="text-xl text-gray-200 mb-8">
                        ¡Es momento de elegir al afortunado ganador de nuestra rifa!
                    </p>
                </motion.div>

                <Card className="mb-8 bg-white border border-gray-200 shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-2xl">Seleccionar Ganador</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full"
                        >
                            <Button
                                size="lg"
                                onClick={selectRandomWinner}
                                disabled={isSelecting || availableStudents.length === 0}
                            >
                                <Gift className="mr-2 h-6 w-6" />
                                {isSelecting ? '¡Seleccionando al Ganador!' : '¡Seleccionar Ganador!'}
                            </Button>
                        </motion.div>

                        <AnimatePresence>
                            {selectedStudent && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.5 }}
                                    className="w-full max-w-md mt-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-8 text-white shadow-xl"
                                >
                                    <h3 className="text-2xl font-bold mb-6">¡Felicidades al Ganador!</h3>
                                    <div className="space-y-4 text-left">
                                        <p className="text-xl"><span className="font-semibold">Nombre:</span> {selectedStudent.name}</p>
                                        <p><span className="font-semibold">Matrícula:</span> {selectedStudent.matricula}</p>
                                        <p><span className="font-semibold">Carrera:</span> {selectedStudent.career}</p>
                                        <p><span className="font-semibold">Campus:</span> {selectedStudent.campus}</p>
                                        <p><span className="font-semibold">Semestre:</span> {selectedStudent.semester}</p>
                                        <p><span className="font-semibold">Tipo:</span> {selectedStudent.userType === 'student' ? 'Estudiante' : 'ExaTecmi'}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>

                <div className="text-center mt-8">
                    <p className="text-white text-lg">
                        Total de Participantes: <span className="font-bold">{students.length}</span> | 
                        Disponibles: <span className="font-bold">{availableStudents.length}</span> | 
                        Ganadores Previos: <span className="font-bold">{previousWinners.length}</span> 
                        <Link href="/admin" className='underline ml-2'>Volver</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}