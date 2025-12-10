interface Residente {
  id: number;
  usuario: string;
  correo: string;
  fecha: string;
  es_creador: boolean;
}

export interface TicketPendiente {
  id: number;
  categoria_hogar: number;
  nombre: string;
  descripcion: string;
  monto_total: number;
  fecha_creacion: string;
  fecha_expiracion: string;
  nombre_usuario: string;
  nombre_categoria: string;
}

export interface TicketAprobado {
  id: number;
  nombre: string;
  descripcion: string;
  monto_total: number; 
  fecha_creacion: string;
  fecha_expiracion: string;
  nombre_usuario: string;   
  nombre_categoria: string; 
}

export interface ApiResponse {
  status: string;
  tickets: TicketAprobado[];
}