'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Users, PieChart } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart as ReChartPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CAREERS, CAMPUSES } from '@/app/data/constants';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import EmpresaRegistrationForm from '@/components/EmpresaForm';

// Define a type for student data
interface Student {
  id: string;
  name: string;
  matricula: string;
  career: string;
  campus: string;
  semester: number;
  userType: 'student' | 'alumni';
}

// Define a type for empresa data
interface Empresa {
  id: string;
  created_at: string;
  nombreColaborador: string;
  nombreEmpresa: string;
  carreraBuscada: string;
}

// Define colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

export default function AdminPage() {
  const [selectedStudentToEdit, setSelectedStudentToEdit] = useState<Student | null>(null);
  const [selectedEmpresaToEdit, setSelectedEmpresaToEdit] = useState<Empresa | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'student' | 'empresa'; id: string } | null>(null);

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    const supabase = createClient();
    const { type, id } = itemToDelete;

    try {
      const { error } = await supabase
        .from(type === 'student' ? 'RegistroTecmi' : 'RegistroEmpresas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success(`${type === 'student' ? 'Estudiante' : 'Empresa'} eliminado con éxito`);

      // Refresh data
      if (type === 'student') {
        const { data } = await supabase.from('RegistroTecmi').select('*');
        if (data) {
          setStudents(data as Student[]);
          processChartData(data as Student[]);
        }
      } else {
        const { data } = await supabase.from('RegistroEmpresas').select('*');
        if (data) setEmpresas(data as Empresa[]);
      }
    } catch (err) {
      console.error('Error al eliminar:', err);
      toast.error('Error al eliminar el registro');
    } finally {
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleEdit = async (type: 'student' | 'empresa', item: Student | Empresa) => {
    if (type === 'student') {
      setSelectedStudentToEdit(item as Student);
    } else {
      setSelectedEmpresaToEdit(item as Empresa);
    }
  };

  const handleUpdate = async (type: 'student' | 'empresa', updatedData: any) => {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from(type === 'student' ? 'RegistroTecmi' : 'RegistroEmpresas')
        .update(updatedData)
        .eq('id', updatedData.id);

      if (error) throw error;

      toast.success(`${type === 'student' ? 'Estudiante' : 'Empresa'} actualizado con éxito`);

      // Refresh data
      if (type === 'student') {
        const { data } = await supabase.from('RegistroTecmi').select('*');
        if (data) {
          setStudents(data as Student[]);
          processChartData(data as Student[]);
        }
        setSelectedStudentToEdit(null);
      } else {
        const { data } = await supabase.from('RegistroEmpresas').select('*');
        if (data) setEmpresas(data as Empresa[]);
        setSelectedEmpresaToEdit(null);
      }
    } catch (err) {
      console.error('Error al actualizar:', err);
      toast.error('Error al actualizar el registro');
    }
  };
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data for charts
  const [campusData, setCampusData] = useState<Array<{ name: string; value: number }>>([]);
  const [careerData, setCareerData] = useState<Array<{ name: string; value: number }>>([]);
  const [userTypeData, setUserTypeData] = useState<Array<{ name: string; value: number }>>([]);

  // Load real student data from Supabase
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const supabase = createClient();

        const { data, error } = await supabase
          .from('RegistroTecmi')
          .select('*');

        if (error) {
          throw error;
        }

        if (data) {
          setStudents(data as Student[]);

          // Process data for charts
          processChartData(data as Student[]);
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Error al cargar los estudiantes. Por favor, intenta de nuevo.');
        toast.error('Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Load empresas data from Supabase
  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const supabase = createClient();
        console.log('Iniciando consulta a Supabase...'); // Depuración

        const { data, error } = await supabase
          .from('RegistroEmpresas') // Nombre de la tabla en Supabase
          .select('*');

        if (error) {
          console.error('Error en la consulta:', error); // Depuración
          throw error;
        }

        if (data) {
          console.log('Datos de empresas:', data); // Depuración
          setEmpresas(data as Empresa[]);
        } else {
          console.log('No se encontraron datos en la tabla.'); // Depuración
        }
      } catch (err) {
        console.error('Error fetching empresas:', err);
        toast.error('Error al cargar las empresas');
      }
    };

    fetchEmpresas();
  }, []);

  // Process data for charts
  const processChartData = (data: Student[]) => {
    // Process campus data
    const campusCounts: Record<string, number> = {};
    CAMPUSES.forEach(campus => {
      campusCounts[campus.name] = 0;
    });

    data.forEach(student => {
      const campusName = CAMPUSES.find(c => c.id === student.campus)?.name || student.campus;
      campusCounts[campusName] = (campusCounts[campusName] || 0) + 1;
    });

    const campusChartData = Object.entries(campusCounts)
      .filter(([_, count]) => count > 0) // Only include campuses with students
      .map(([name, value]) => ({ name, value }));
    setCampusData(campusChartData);

    // Process career data
    const careerCounts: Record<string, number> = {};
    data.forEach(student => {
      const careerName = CAREERS.find(c => c.id === student.career)?.name || student.career;
      careerCounts[careerName] = (careerCounts[careerName] || 0) + 1;
    });

    const careerChartData = Object.entries(careerCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value) // Sort by count in descending order
      .slice(0, 5); // Only show top 5 careers
    setCareerData(careerChartData);

    // Process user type data
    const userTypeCounts = {
      'Estudiantes': 0,
      'ExaTecmis': 0
    };

    data.forEach(student => {
      if (student.userType === 'student') {
        userTypeCounts['Estudiantes']++;
      } else if (student.userType === 'alumni') {
        userTypeCounts['ExaTecmis']++;
      }
    });

    const userTypeChartData = Object.entries(userTypeCounts)
      .map(([name, value]) => ({ name, value }));
    setUserTypeData(userTypeChartData);
  };

  const selectRandomWinner = () => {
    setIsSelecting(true);

    // Simulate API call delay
    setTimeout(() => {
      if (students.length > 0) {
        // Select a random student from the array
        const randomIndex = Math.floor(Math.random() * students.length);
        const winner = students[randomIndex];

        setSelectedStudent(winner);
        toast.success('¡Ganador seleccionado!');
      } else {
        toast.error('No hay estudiantes disponibles');
      }

      setIsSelecting(false);
    }, 2000);
  };

  // Custom label for pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <div className="min-h-screen bg-custom-green py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado con título y botón de Registro de Empresas */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Panel de Administrador</h1>
            <p className="text-lg text-gray-300">Selección de ganadores de la rifa</p>
          </div>
          <div className="flex gap-4">
            <Link href="/admin/empresas">
              <Button className="bg-white text-custom-green hover:bg-gray-100">
                Lista de empresas
              </Button>
            </Link>

            <Link href="/winner">
              <Button variant="outline" className="bg-white text-admin-blue hover:bg-gray-100">
                Selección de Ganador
              </Button>
            </Link>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Campus Distribution Chart */}
          <Card className="bg-white border border-gray-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Distribución por Campus</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="h-64">
              {!isLoading && campusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ReChartPie>
                    <Pie
                      data={campusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {campusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-2 border border-gray-200 rounded shadow-md">
                              <p className="font-medium">{payload[0].name}</p>
                              <p>{`${payload[0].value} participantes`}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                  </ReChartPie>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  {isLoading ? 'Cargando datos...' : 'No hay datos disponibles'}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Career Distribution Chart */}
          <Card className="bg-white border border-gray-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top 5 Carreras</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="h-64">
              {!isLoading && careerData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={careerData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={100}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" name="Participantes" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  {isLoading ? 'Cargando datos...' : 'No hay datos disponibles'}
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Type Distribution Chart */}
          <Card className="bg-white border border-gray-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tipo de Usuario</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="h-64">
              {!isLoading && userTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ReChartPie>
                    <Pie
                      data={userTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-2 border border-gray-200 rounded shadow-md">
                              <p className="font-medium">{payload[0].name}</p>
                              <p>{`${payload[0].value} participantes`}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                  </ReChartPie>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  {isLoading ? 'Cargando datos...' : 'No hay datos disponibles'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Total de Participantes */}
          <Card className="bg-white border border-gray-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-muted-foreground">
                Estudiantes registrados
              </p>
            </CardContent>
          </Card>

          {/* Total de Empresas */}
          <Card className="bg-white border border-gray-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{empresas.length}</div>
              <p className="text-xs text-muted-foreground">
                Empresas registradas
              </p>
            </CardContent>
          </Card>

          {/* Estado */}
          <Card className="bg-white border border-gray-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? 'Cargando...' : error ? 'Error' : 'Listo'}</div>
              <p className="text-xs text-muted-foreground">
                {isLoading ? 'Obteniendo datos...' : error ? 'Error al cargar datos' : 'Datos cargados correctamente'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Participantes */}
        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle>Lista de Participantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Nombre</th>
                    <th className="text-left py-3 px-4">Matrícula</th>
                    <th className="text-left py-3 px-4">Carrera</th>
                    <th className="text-left py-3 px-4">Campus</th>
                    <th className="text-left py-3 px-4">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.matricula} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{student.name}</td>
                      <td className="py-2 px-4">{student.matricula}</td>
                      <td className="py-2 px-4">{CAREERS.find(c => c.id === student.career)?.name || student.career}</td>
                      <td className="py-2 px-4">{student.campus}</td>
                      <td className="py-2 px-4">{student.userType === 'student' ? 'Estudiante' : 'ExaTecmi'}</td>
                      <td className="py-2 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit('student', student)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setItemToDelete({ type: 'student', id: student.id });
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Empresas Registradas */}
        {/* <Card className="bg-white border border-gray-200 shadow-lg mt-6">
          <CardHeader>
            <CardTitle>Lista De Empresas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Nombre Colaborador</th>
                    <th className="text-left py-3 px-4">Nombre Empresa</th>
                    <th className="text-left py-3 px-4">Carrera Buscada</th>
                  </tr>
                </thead>
                <tbody>
                  {empresas.map((empresa) => (
                    <tr key={empresa.created_at} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{empresa.nombreColaborador}</td>
                      <td className="py-2 px-4">{empresa.nombreEmpresa}</td>
                      <td className="py-2 px-4">{empresa.carreraBuscada.split(',').map(id => CAREERS.find(c => c.id === id)?.name || id).join(', ')}</td>
                      <td className="py-2 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit('empresa', empresa)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setItemToDelete({ type: 'empresa', id: empresa.id });
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p>¿Estás seguro que deseas eliminar este registro?</p>
            <p className="text-sm text-gray-500 mt-2">Esta acción no se puede deshacer.</p>
          </div>
          <div className="flex justify-end gap-3 p-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={selectedStudentToEdit !== null} onOpenChange={() => setSelectedStudentToEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Estudiante</DialogTitle>
          </DialogHeader>
          {selectedStudentToEdit && (
            <div className="p-4 space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label>Nombre</label>
                  <input
                    className="border p-2 rounded"
                    value={selectedStudentToEdit.name}
                    onChange={(e) => setSelectedStudentToEdit({
                      ...selectedStudentToEdit,
                      name: e.target.value
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <label>Matrícula</label>
                  <input
                    className="border p-2 rounded"
                    value={selectedStudentToEdit.matricula}
                    onChange={(e) => setSelectedStudentToEdit({
                      ...selectedStudentToEdit,
                      matricula: e.target.value
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <label>Carrera</label>
                  <select
                    className="border p-2 rounded"
                    value={selectedStudentToEdit.career}
                    onChange={(e) => setSelectedStudentToEdit({
                      ...selectedStudentToEdit,
                      career: e.target.value
                    })}
                  >
                    {CAREERS.map((career) => (
                      <option key={career.id} value={career.id}>
                        {career.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <label>Campus</label>
                  <select
                    className="border p-2 rounded"
                    value={selectedStudentToEdit.campus}
                    onChange={(e) => setSelectedStudentToEdit({
                      ...selectedStudentToEdit,
                      campus: e.target.value
                    })}
                  >
                    {CAMPUSES.map((campus) => (
                      <option key={campus.id} value={campus.id}>
                        {campus.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedStudentToEdit(null)}>
                  Cancelar
                </Button>
                <Button onClick={() => handleUpdate('student', selectedStudentToEdit)}>
                  Guardar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Empresa Dialog */}
      <Dialog open={selectedEmpresaToEdit !== null} onOpenChange={() => setSelectedEmpresaToEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Empresa</DialogTitle>
          </DialogHeader>
          {selectedEmpresaToEdit && (
            <div className="p-4 space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label>Nombre del Colaborador</label>
                  <input
                    className="border p-2 rounded"
                    value={selectedEmpresaToEdit.nombreColaborador}
                    onChange={(e) => setSelectedEmpresaToEdit({
                      ...selectedEmpresaToEdit,
                      nombreColaborador: e.target.value
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <label>Nombre de la Empresa</label>
                  <input
                    className="border p-2 rounded"
                    value={selectedEmpresaToEdit.nombreEmpresa}
                    onChange={(e) => setSelectedEmpresaToEdit({
                      ...selectedEmpresaToEdit,
                      nombreEmpresa: e.target.value
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <label>Carreras Buscadas</label>
                  <input
                    className="border p-2 rounded"
                    value={selectedEmpresaToEdit.carreraBuscada}
                    onChange={(e) => setSelectedEmpresaToEdit({
                      ...selectedEmpresaToEdit,
                      carreraBuscada: e.target.value
                    })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedEmpresaToEdit(null)}>
                  Cancelar
                </Button>
                <Button onClick={() => handleUpdate('empresa', selectedEmpresaToEdit)}>
                  Guardar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}