export interface Comedor {
  id: number;
  nombre: string;
  direccion: string;
  latitud?: number;
  longitud?: number;
  capacidad?: number;
  horarios?: string;
  telefono?: string;
  activo?: boolean;
  calificacion?: number;
  creado_por?: number;
}
