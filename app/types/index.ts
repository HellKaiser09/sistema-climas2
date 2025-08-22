export type Career = {
  id: string;
  name: string;
};

export type Campus = {
  id: string;
  name: string;
};

export type Student = {
  id: string;
  name: string;
  matricula: string;
  semester: number;
  career: string;
  campus: string;
  createdAt: Date;
};
export interface Empresa {
  created_at: string;
  nombreColaborador: string;
  nombreEmpresa: string;
  carreraBuscada: string;
  logo?: string;
  descripcion?: string;
  correo?: string;
}
