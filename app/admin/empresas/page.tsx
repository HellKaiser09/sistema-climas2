'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import EmpresaRegistrationForm from '@/components/EmpresaForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CAREERS } from '@/app/data/constants';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import CloudinaryUpload from '@/components/CloudinaryUpload';

interface Empresa {
  id?: number;
  created_at: string;
  nombreColaborador: string;
  nombreEmpresa: string;
  carreraBuscada: string;
  logo?: string;
  descripcion?: string;
  correo?: string;
  telefono?: string;
  requiereStand?: boolean;
  luz?: boolean;

}

export default function EmpresasListPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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

  const filteredEmpresas = empresas.filter(empresa =>
    empresa.nombreEmpresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.nombreColaborador.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCareerNames = (careerString: string) => {
    const careerIds = careerString.split(',');
    return careerIds.map(id =>
      CAREERS.find(career => career.id === id)?.name || id
    ).join(', ');
  };

  const handleDeleteEmpresa = async (id: number, nombreEmpresa: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('RegistroEmpresas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Actualizar el estado local removiendo la empresa eliminada
      setEmpresas(empresas.filter(empresa => empresa.id !== id));

      console.log(`Empresa ${nombreEmpresa} eliminada exitosamente`);
    } catch (error) {
      console.error('Error al eliminar empresa:', error);
      alert('Error al eliminar la empresa. Inténtalo de nuevo.');
    }
  };

  const handleEditEmpresa = (empresa: Empresa) => {
    setEditingEmpresa(empresa);
    setIsEditDialogOpen(true);
  };

  const handleUpdateEmpresa = async (updatedData: Partial<Empresa>) => {
    if (!editingEmpresa?.id) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('RegistroEmpresas')
        .update(updatedData)
        .eq('id', editingEmpresa.id);

      if (error) throw error;

      // Actualizar el estado local
      setEmpresas(empresas.map(empresa =>
        empresa.id === editingEmpresa.id
          ? { ...empresa, ...updatedData }
          : empresa
      ));

      setIsEditDialogOpen(false);
      setEditingEmpresa(null);
      console.log('Empresa actualizada exitosamente');
    } catch (error) {
      console.error('Error al actualizar empresa:', error);
      alert('Error al actualizar la empresa. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-custom-green py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Empresas Registradas</h1>
            <p className="text-lg text-gray-100">
              Listado de empresas participantes en la feria de empleo
            </p>
          </div>
          <Link href="/empresa-registro">
            <Button className="bg-white text-custom-green hover:bg-gray-100">
              Página de Registro de Empresas
            </Button>
          </Link>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-white text-custom-green hover:bg-gray-100">
                Ver Formulario de Empresa
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Formulario de Empresa (Solo Vista)</DialogTitle>
                <p className="text-sm text-gray-600">Este formulario es solo para que veas las preguntas. Las empresas deben usar la página pública.</p>
              </DialogHeader>
              <EmpresaRegistrationForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <Input
            placeholder="Buscar por nombre de empresa o colaborador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8">Cargando empresas...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Carreras Buscadas</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Fecha de Registro</TableHead>
                  <TableHead>Requiere Stand</TableHead>
                  <TableHead>Requiere conexión eléctrica</TableHead>

                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmpresas.map((empresa, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {empresa.logo ? (
                        <img
                          src={empresa.logo}
                          alt={`Logo de ${empresa.nombreEmpresa}`}
                          className="w-12 h-12 object-contain rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div
                        className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500"
                        style={{ display: empresa.logo ? 'none' : 'flex' }}
                      >
                        Sin logo
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{empresa.nombreEmpresa}</TableCell>
                    <TableCell>{empresa.nombreColaborador}</TableCell>
                    <TableCell>{getCareerNames(empresa.carreraBuscada)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {empresa.correo && <div>{empresa.correo}</div>}
                        {empresa.telefono && <div>{empresa.telefono}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(empresa.created_at).toLocaleDateString('es-MX')}
                    </TableCell>
                    <TableCell>
                      <div
                        className={`text-center rounded-full px-2 py-1 text-white ${empresa.requiereStand ? 'bg-green-500' : 'bg-red-500'
                          }`}
                      >
                        {empresa.requiereStand ? 'Sí' : 'No'}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div
                        className={`text-center rounded-full px-2 py-1 text-white ${empresa.luz ? 'bg-green-500' : 'bg-red-500'
                          }`}
                      >
                        {empresa.luz ? 'Sí' : 'No'}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditEmpresa(empresa)}
                        >
                          Editar
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Eliminar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente la empresa "{empresa.nombreEmpresa}" de la base de datos.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => empresa.id && handleDeleteEmpresa(empresa.id, empresa.nombreEmpresa)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredEmpresas.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No se encontraron empresas que coincidan con la búsqueda
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Empresa</DialogTitle>
          </DialogHeader>
          {editingEmpresa && (
            <EditEmpresaForm
              empresa={editingEmpresa}
              onSave={handleUpdateEmpresa}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente para editar empresa
interface EditEmpresaFormProps {
  empresa: Empresa;
  onSave: (data: Partial<Empresa>) => void;
  onCancel: () => void;
}

function EditEmpresaForm({ empresa, onSave, onCancel }: EditEmpresaFormProps) {
  const [formData, setFormData] = useState<Partial<Empresa>>({
    nombreEmpresa: empresa.nombreEmpresa || '',
    nombreColaborador: empresa.nombreColaborador || '',
    correo: empresa.correo || '',
    telefono: empresa.telefono || '',
    descripcion: empresa.descripcion || '',
    carreraBuscada: empresa.carreraBuscada || '',
    logo: empresa.logo || ''
  });

  const [selectedCareers, setSelectedCareers] = useState<string[]>(
    empresa.carreraBuscada ? empresa.carreraBuscada.split(',') : []
  );

  const handleCareerChange = (careerId: string, checked: boolean) => {
    let newSelectedCareers: string[];
    if (checked) {
      newSelectedCareers = [...selectedCareers, careerId];
    } else {
      newSelectedCareers = selectedCareers.filter(id => id !== careerId);
    }
    setSelectedCareers(newSelectedCareers);
    setFormData(prev => ({
      ...prev,
      carreraBuscada: newSelectedCareers.join(',')
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos obligatorios
    if (!formData.nombreEmpresa?.trim()) {
      alert('El nombre de la empresa es obligatorio');
      return;
    }
    if (!formData.nombreColaborador?.trim()) {
      alert('El nombre del colaborador es obligatorio');
      return;
    }
    if (!formData.logo?.trim()) {
      alert('El logo es obligatorio');
      return;
    }
    if (!formData.carreraBuscada?.trim()) {
      alert('Debe seleccionar al menos una carrera');
      return;
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nombreEmpresa">Nombre de la Empresa *</Label>
          <Input
            id="nombreEmpresa"
            value={formData.nombreEmpresa}
            onChange={(e) => setFormData(prev => ({ ...prev, nombreEmpresa: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="nombreColaborador">Nombre del Colaborador *</Label>
          <Input
            id="nombreColaborador"
            value={formData.nombreColaborador}
            onChange={(e) => setFormData(prev => ({ ...prev, nombreColaborador: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="correo">Correo Electrónico</Label>
          <Input
            id="correo"
            type="email"
            value={formData.correo}
            onChange={(e) => setFormData(prev => ({ ...prev, correo: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            value={formData.telefono}
            onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="logo">URL del Logo *</Label>
        <CloudinaryUpload
          value={formData.logo}
          onChange={(url) => setFormData(prev => ({ ...prev, logo: url }))}
        />
      </div>

      <div>
        <Label htmlFor="descripcion">Descripción de la Empresa</Label>
        <Textarea
          id="descripcion"
          value={formData.descripcion}
          onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
          rows={3}
        />
      </div>

      <div>
        <Label>Carreras Buscadas *</Label>
        <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
          {CAREERS.map((career) => (
            <div key={career.id} className="flex items-center space-x-2">
              <Checkbox
                id={career.id}
                checked={selectedCareers.includes(career.id)}
                onCheckedChange={(checked) => handleCareerChange(career.id, checked === true)}
              />
              <Label htmlFor={career.id} className="text-sm">
                {career.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Guardar Cambios
        </Button>
      </div>
    </form>
  );
}