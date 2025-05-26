export interface Hogar {
  id: number;
  nombre: string;
  descripcion: string;
  codigo: string;
  fecha_creacion: string;
  es_creador: boolean;
}

export interface RespuestaHogar {
  status: string;
  hogares: Hogar[];
}