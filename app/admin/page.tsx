"use client";
import React from "react";

export default function DashboardPage() {
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
    </>
  );
}
